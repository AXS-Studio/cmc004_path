<?php
session_start();
require_once("database.php");

//--------------------------------------------------------------------------------------------
//Get description for questionID
function getDescription($questionID){
	global $mysqli;
	
	$q = "SELECT `Description` FROM `Questions` WHERE `QuestionID` = '$questionID'";
	if ($result = $mysqli->query($q)){
		$row = $result->fetch_assoc();
		
		$name = $row['Description'];
		$result->free();
	}
	return $name;
}//end getDescription

//--------------------------------------------------------------------------------------------
//Get answer set for specific patient and questionID
function getAnswers($patientID, $questionID, $questionType){
	global $mysqli;
	$answerArray = array();
	
	$q = "SELECT `Date`, `Answer` FROM `Answers` 
	WHERE `PatientID` = '$patientID' AND `QuestionID` = '$questionID'";
	if ($result = $mysqli->query($q)){
		
		while($row = $result->fetch_assoc()){
			$bus = array('Date' => $row['Date'], 'Data' => $row['Answer']);
			$bus['Data'] = convertAnswer($bus['Data'], $questionType); //convert data to correct integer format
						
			array_push($answerArray, $bus);
		}
		$result->free();
		unset($bus);

		numericalAnalysis(&$answerArray);
	}
	return $answerArray;
}//end getAnswers
//--------------------------------------------------------------------------------------------
// Returns:
// (I) Integral/Area under curve calculated from trapezoid rule
// (MA) Exponentially Smoothed Moving Average - converted from math: http://www.fourmilab.ch/hackdiet/www/subsubsection1_4_1_0_8_3.html
function numericalAnalysis($answerArray) {
  //Set first boundary cases
  $answerArray[0]['MA'] = $answerArray[0]['Data']; //MA set to first data value
  $answerArray[0]['I'] = $answerArray[0]['Data']; //Integral set to first data value
  
  for($i=1; $i<sizeof($answerArray); $i++) {
    //Calculate Moving Average
	$answerArray[$i]['MA'] = $answerArray[$i-1]['MA'] + 0.1 * ($answerArray[$i]['Data'] - $answerArray[$i-1]['MA']);
 	
	//Calculate Integral
 	$timeDiff = (strtotime($answerArray[$i]['Date'])-strtotime($answerArray[$i-1]['Date']))/(60*60*24); //difference between two dates (unit: days)
	$answerArray[$i]['I'] = $answerArray[$i-1]['I']+($answerArray[$i]['Data']+$answerArray[$i-1]['Data'])*($timeDiff/2); //get area of trapezoid, add to running sum
  }//end for loop
}
//--------------------------------------------------------------------------------------------
//Converts raw database answer to integer, normalizes if of type Multiple Choice
function convertAnswer($input, $questionType){
	if ($questionType!='VAS'){
		$arr = explode("_", $input, 2); //eg. explode Anchor_0 at "_"
		$input = (int) $arr[1]; //take the second item

		if ($questionType=='OTHER')
		return 100*($input); //2 choices for OTHER - 0 or 100
		else
		return 100*($input)/4; //5 choices for ASRM and DIDS - 0, 25, 50, 75, 100		
	}
	else if ($questionType == 'VAS')
	return (int) $input;
}
//--------------------------------------------------------------------------------------------
//Check if answers exist for specific question for specific patient
function answerLength($questionID, $patientID){
	global $mysqli;
	
	$q ="SELECT 1 FROM `Answers` WHERE `QuestionID`='$questionID' AND `PatientID` ='$patientID'";//LIMIT 1
	
	if ($result = $mysqli->query($q)){
		$numRows = $result->num_rows;
		$result->free();
	}
	return $numRows;
}

//--------------------------------------------------------------------------------------------
//Get comments for patient
function getComments($patientID){
	global $mysqli;
	$answerArray = array();
	
	$q = "SELECT `Date`, `Answer` FROM `Answers` 
	WHERE `PatientID` = '$patientID' AND `QuestionID` = 'comments'";
	if ($result = $mysqli->query($q)){		
		while($row = $result->fetch_assoc()){
			$bus = array('Date' => $row['Date'], 'Data' => $row['Answer']);
			array_push($answerArray, $bus);
		}
		$result->free();
		unset($bus);
	}
	
	return $answerArray;
}//end getComments
//--------------------------------------------------------------------------------------------
//Get aggregate scores for patient (this should be ported to MHT submit.php after backloggin is complete)
//This function is needed to backlog Aggregate scores
//In the future all aggregate scores will be computed as soon as questinnaire answers are submitted
echo '<pre>', print_r(getAggregate('Cindy.Lau@axs3d.com'), true), '</pre>';

function getAggregate($tempID){
	global $mysqli;
	$answerArray = array();
	
	$DIDArray = array("mc_0","mc_3","mc_4","mc_5","mc_6","mc_7","mc_8","mc_9","mc_10","mc_11","mc_12","mc_13","mc_14","mc_15");
	$ASRMArray = array("mc_16","mc_17","mc_18","mc_19","mc_20");
	
	//Get all sessionIDs for completed questionnaires for this user
	//Store in array for accessing later
	$sessionArray = array();
	$q = "SELECT `Date`, `SessionID`, `Infreq`, `Completed` FROM `Sessions_MHT` WHERE `PatientID` = '$tempID' AND `Completed` != '0000-00-00 00:00:00'";
	if ($result = $mysqli->query($q)){
		while ($row = $result->fetch_assoc()){
			$sessionArray[] = $row;
		}
		$result->free();
	}
	/*	Resultant array is as follows
		[0] => Array
			(
				[Date] => 2013-02-28 10:48:24
				[SessionID] => 33
				[Infreq] => 0
				[Completed] => 2013-02-28 10:48:55
			)
		echo '<pre>', print_r($data, true), '</pre>';
	*/	
	
	//Sum up scores from same session for all DIDs questions
	for($i=0; $i<sizeof($sessionArray); $i++) {
		$NADID = 0;
		$NAASRM = 0;
		$NADIDcounter = 0;
		$NAASRMcounter = 0;
		$lastDate;
		
		$currentSessionID = $sessionArray[$i]['SessionID'];
		$q = "SELECT `Date`, `QuestionID`, `Answer` FROM `Answers` WHERE `SessionID` = '$currentSessionID'";
		if ($result = $mysqli->query($q)){
			while($row = $result->fetch_assoc()){
				//Add up all items of a similar category
				if (in_array($row['QuestionID'], $DIDArray)){
					$NADID = $NADID + convertAnswer($row['Answer'], 'DID');
					$NADIDcounter ++;
				}
				else if (in_array($row['QuestionID'], $ASRMArray)){
					$NAASRM = $NAASRM + convertAnswer($row['Answer'], 'ASRM');
					$NAASRMcounter ++;
				}
				$lastDate = $row['Date']; //Get last entered date
			}//end while
			
			$result->free();
		
			if ($NADIDcounter)
			$NADID = $NADID/$NADIDcounter;
			
			if ($NAASRMcounter)
			$NAASRM = $NAASRM/$NAASRMcounter;
			
			$bus = array('Date' => $lastDate, 'Data' => $NADID);
			array_push($answerArray, $bus);
			$bus = array('Date' => $lastDate, 'Data' => $NAASRM);
			array_push($answerArray, $bus);
		}//end if
		
	}//end for loop

	unset($bus);
	
	return $answerArray;
}//end getAggregate
?>