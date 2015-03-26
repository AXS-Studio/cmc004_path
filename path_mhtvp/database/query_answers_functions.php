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
  //$answerArray[0]['I'] = $answerArray[0]['Data']; //Integral set to first data value
  
  for($i=1; $i<sizeof($answerArray); $i++) {
    //Calculate Moving Average
	$answerArray[$i]['MA'] = $answerArray[$i-1]['MA'] + 0.5 * ($answerArray[$i]['Data'] - $answerArray[$i-1]['MA']);
 	
	
	//Calculate Integral
 	$timeDiff = (strtotime($answerArray[$i]['Date'])-strtotime($answerArray[$i-1]['Date']))/(60*60*24); //difference between two dates (unit: days)
	$answerArray[$i]['I'] = $answerArray[$i-1]['I']+($answerArray[$i]['Data']+$answerArray[$i-1]['Data'])*($timeDiff/2); //get area of trapezoid, add to running sum
  	
  }//end for loop
}
//--------------------------------------------------------------------------------------------
//Converts raw database answer to integer, normalizes if of type Multiple Choice
function convertAnswer($input, $questionType){
	//echo $input."<br>";
	//echo $questionType."<br>";
	
	if ($questionType == 'VAS' || $questionType == 'SCORE'){
		return (int) $input; //for VAS and SCORE
	}
	else{
		$arr = explode("_", $input, 2); //eg. explode Anchor_0 at "_"
		$input = (int) $arr[1]; //take the second item

		if ($questionType=='OTHER')
		return 100*($input); //2 choices for OTHER - 0 or 100
		else if ($questionType=='ASRM')
		return 100*($input)/4; //5 choices for ASRM - 0, 25, 50, 75, 100
		else if ($questionType=='QIDS')
		return 100*($input)/3; //4 choices for QIDS - 0, 33.33, 66.66, 100		
	}
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
	WHERE `PatientID` = '$patientID' AND `QuestionID` = 'comments' AND length(`Answer`) != 0";
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
//Get Clinician Notes
function getClinicianNotes($patientID, $clinicianID){
	global $mysqli;
	$answerArray = array();
	$returnArray = array();
	
	$q = "SELECT * FROM `ClinicianNotes`
	WHERE `PatientID` = '$patientID' AND `ClinicianID` = '$clinicianID'";
	if ($result = $mysqli->query($q)){		
		while($row = $result->fetch_assoc()){
			$bus = array('noteID' => $row['NoteID'],'clinicianID' => $row['ClinicianID'],'Date' => $row['Date'],'data' => $row['Data']);
			array_push($answerArray, $bus);
			$nextID = (int) $row['NextID'];
		}//end while
		
		$result->free();
		unset($bus);
	}//end if
	
	$returnArray['nextID'] = $nextID;
	$returnArray['notes'] = $answerArray;
	
	return $returnArray;
}
//--------------------------------------------------------------------------------------------
//Get Sessions
function getSessions($patientID, $clinicianID, $sessionName){
	global $mysqli;
	$answerArray = array();
	$answerArray["sessions"] = array();
	
	$q = "SELECT `SessionName` FROM `Sessions_PATH`
		WHERE `PatientID` = '$patientID' AND `ClinicianID` = '$clinicianID'";
			
	if ($result = $mysqli->query($q)){		
		if ($result->num_rows >0){
				while($row = $result->fetch_assoc()){	
					$answerArray["sessions"][] = $row['SessionName'];
				}//end while
			
			if (isset($sessionName)){
				$q = "SELECT  `PatientID`, `ClinicianID`, `Date`, `SessionName`, `Settings` FROM `Sessions_PATH`
				WHERE `PatientID` = '$patientID' AND `ClinicianID` = '$clinicianID' AND `SessionName` = '$sessionName'";
				/*
				else
				$q = "SELECT  `PatientID`, `ClinicianID`, MAX(`Date`), `SessionName`, `Settings` FROM `Sessions_PATH`
				WHERE `PatientID` = '$patientID' AND `ClinicianID` = '$clinicianID'";
				*/
				if ($result = $mysqli->query($q)){		
					$row = $result->fetch_assoc();
					
					$answerArray["current"] = array(
								'patientID' => $row['PatientID'],
								'clinicianID' => $row['ClinicianID'],
								'session' => $row['SessionName'],
								'data' => unserialize($row['Settings']));
				}//end if ($result = $mysqli...
			
				
			}
			else{
				//$sessionName is not set
				$answerArray["current"]["name"] = "Create New";
			}
		}//end if ($result->num_rows...
		else{
			//No previous sessions found
			$answerArray["current"]["name"] = "Create New";
		}
	}

	return $answerArray;
}
?>