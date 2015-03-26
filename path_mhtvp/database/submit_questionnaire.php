<?php
/* submit_questionnaire.php
 * Allows editing for each patients' questionnaire settings
 */

session_start();
require_once("database.php");

//POST action
if(isset($_POST['subCustomize'])){
	
	//$userID = $_POST['UserID'];
	$userID = $_SESSION['userName'];
	$patientID = $_POST['PatientDropdown'];//eg. Record01
	$shortFormFrequency = intval($_POST['ShortFormFrequency']);
  	$longFormFrequency = intval($_POST['LongFormFrequency']);
	$reminder = intval($_POST['Reminder']);//0, or 1
	$reminderMax = intval($_POST['ReminderMax']);//0 to?
	$reminderFrequency = intval($_POST['ReminderFrequency']); //minutes
	$randomizeQuestions =  intval($_POST['RandomizeQuestions']);//0, or 1
	$randomizeVASAnchors =  intval($_POST['RandomizeVASAnchors']);//0 or 1
	$startDate =  $_POST['StartDate'];//mm/dd/yyy
	
	$timeArray = array();//[09:00, 12:00...]
	array_push($timeArray, $_POST['Time1']);
	array_push($timeArray, $_POST['Time2']);
	array_push($timeArray, $_POST['Time3']);
	array_push($timeArray, $_POST['Time4']);
	array_push($timeArray, $_POST['Time5']);
	
	//array containing questionID's selected for inclusion 
	//QIDS_0 - 11, ASRM_0 - 4, OTHER_0-1, VAS_0-8
	
	$questions = array();
	$questionsInfreq = array();
	for ($i = 0; $i <= 11; $i++){
		$questions['QIDS_'.$i]=$_POST['QIDS_'.$i];
		$questionsInfreq['QIDS_'.$i] = $_POST['QIDS_'.$i.'_Infreq'];
	}
	for ($i = 0; $i <= 4; $i++){
		$questions['ASRM_'.$i]=$_POST['ASRM_'.$i];
		$questionsInfreq['ASRM_'.$i] = $_POST['ASRM_'.$i.'_Infreq'];
	}
	for ($i = 0; $i <= 1; $i++){
		$questions['OTHER_'.$i]=$_POST['OTHER_'.$i];
		$questionsInfreq['OTHER_'.$i] = $_POST['OTHER_'.$i.'_Infreq'];
	}
	for ($i = 0; $i <= 8; $i++){
		$questions['VAS_'.$i]=$_POST['VAS_'.$i];
		$questionsInfreq['VAS_'.$i] = $_POST['VAS_'.$i.'_Infreq'];
	}
	
	//Delete previous question settings
	global $mysqli;
	$q = "DELETE FROM `QuestionnaireSettings` WHERE `PatientID` = '$patientID'";
  	$result = $mysqli->query($q);
	
	//Insert questionnaire settings
	$q = "INSERT INTO `QuestionnaireSettings`(
	`PatientID`, `ShortFormFrequency`,`LongFormFrequency`,
	`Reminder`, `ReminderMax`, `ReminderFrequency`, `RandomizeQuestions`, `RandomizeVASAnchors`, `StartDate`)
	VALUES('$patientID','$shortFormFrequency','$longFormFrequency','$reminder','$reminderMax',
	'$reminderFrequency','$randomizeQuestions','$randomizeVASAnchors', '$startDate')";
	$result = $mysqli->query($q);
	
	//---Insert session times into separate table
	//Delete previous question settings
	$q = "DELETE FROM `QuestionnaireTimes` WHERE `PatientID` = '$patientID'";
  	$result = $mysqli->query($q);
	
	$q = " INSERT INTO `QuestionnaireTimes` VALUES";
	for ($i = 1; $i <= $shortFormFrequency; $i++){
		$value = $timeArray[$i-1];
		$q.="('$patientID','$value','0')";
		
		//Insert reminders as well:
		if ($reminder){
			for ($j = 1; $j <= $reminderMax-1; $j++){
				$time = strtotime($value);
				//$startTime = date("H:i:00", strtotime('-30 minutes', $time));
				$endTime = date("H:i", strtotime('+'.$j*$reminderFrequency.' minutes', $time));
				$q.=",('$patientID','$endTime','1')";
			}
		}//end if reminder
		
		//Append comma if there are more INSERTs to come
		if($i<$shortFormFrequency){
			$q.=",";
		}
	}
	$result = $mysqli->query($q);
	
	//----Assign questions to patient----
	//Delete previous question settings
	$q = "DELETE FROM `PatientToQuestions` WHERE `PatientID` = '$patientID'";
	$result = $mysqli->query($q);
	
	//Read how many questions were checked
	forEach($questions as $key => $value){
		$q = "INSERT INTO `PatientToQuestions`(`PatientID`, `QuestionID`,`Include`,`Infreq`)
		VALUES ('$patientID','$key','$value','$questionsInfreq[$key]')";
		$result = $mysqli->query($q);
	}
	
	logActivity($userID, "Updated questionnaire for patient $patientID");
}//end if isset POST
?>