<?php
/**
 * query.php
 * fetches database data for AJAX calls and returns in JSON format
 * called from clinican.php, patient.php, access.php, questionnaire.php
 */
 
session_start();
require_once("database.php");

//Obtain parameters to be searched and required results
global $mysqli;
$query=$_GET["query"];
$retrieve=$_GET["retrieve"];

switch($retrieve){
  //case 'info':
    //echo getInfo($query);
  //break;
  case 'patient':
    echo getPatient($query);
  break;
  case 'clinician':
    echo getClinician($query);
  break;
  case 'questionnaireSettings':
    echo getQuestionnaireSettings($query);
  break;
  case 'patientAccount':
    echo getPatientAccount($query);
  break;
  case 'clinicianAccount':
    echo getClinicianAccount($query);
  break;
  default:
    echo json_encode(array('error'=>'unknown method'));
  break;
}
$mysqli->close();
exit;

//-----Functions-----//
function getInfo($query){
	//Create JSON array to return all values
	$json = array();
	
	global $mysqli;
	$q = "select * from Clinician where SHSCID = '$query'";
	if ($result = $mysqli->query($q)){
		while($row = $result->fetch_assoc())     
		{
			$bus = array(
				'SHSCID' => $row['SHSCID'],
				'FirstName' => $row['FirstName'],
				'LastName' => $row['LastName'],
				'Email' => $row['Email'],
				'Password' => $row['Password'],
			);
			array_push($json, $bus);
		}
		$result->free();
	}//end query
	$jsonstring = json_encode($json);
	return $jsonstring;
}//end getInfo

function getPatientAccount($query){
	//Create JSON array to return all values
	$json = array();
	
	global $mysqli;
	$q = "select * from `Patient` where `MedicalRecordNum` = '$query'";
	if ($result = $mysqli->query($q)){
		while($row = $result->fetch_assoc())     
		{
			$bus = array(
				'MedicalRecordNum' => $row['MedicalRecordNum'],
				'FirstName' => $row['FirstName'],
				'LastName' => $row['LastName'],
				'Email' => $row['Email'],
				'Password' => $row['Password'],
				'PhoneNum' => $row['PhoneNum'],
				'PhoneCarrier' => $row['PhoneCarrier'],
				'Enabled' => $row['Enabled']
			);
			array_push($json, $bus);
		}
		$result->free();
	}//end query
	$jsonstring = json_encode($json);
	return $jsonstring;
}//end getPatientAccount

function getClinicianAccount($query){
	//Create JSON array to return all values
	$json = array();
	
	global $mysqli;
	$q = "select * from `Clinician` where `SHSCID` = '$query'";
	if ($result = $mysqli->query($q)){
		while($row = $result->fetch_assoc())     
		{
			$bus = array(
				'SHSCID' => $row['SHSCID'],
				'FirstName' => $row['FirstName'],
				'LastName' => $row['LastName'],
				'Email' => $row['Email'],
				'Password' => $row['Password']
			);
			array_push($json, $bus);
		}
		$result->free();
	}//end query
	$jsonstring = json_encode($json);
	return $jsonstring;
}//end getClinicianAccount

function getPatient($query){
	//Create JSON array to return all values
	$json = array();
	
	global $mysqli;
	$q = "SELECT P.MedicalRecordNum 
	FROM Patient P
	INNER JOIN ClinicianToPatient L ON (L.PatientID = P.MedicalRecordNum)
	INNER JOIN Clinician C ON (L.ClinicianID = C.SHSCID)
    WHERE C.SHSCID='$query'
	ORDER BY P.MedicalRecordNum";
	if ($result = $mysqli->query($q)){
		while($row = $result->fetch_assoc())     
		{
			$bus = array(
				'MedicalRecordNum' => $row['MedicalRecordNum'],
			);
			array_push($json, $bus);
		}
		$result->free();
	}//end query
	$jsonstring = json_encode($json);
	return $jsonstring;
}//end getPatient

function getClinician($query){
	//Create JSON array to return all values
	$json = array();
	
	global $mysqli;
	$q = "SELECT C.SHSCID 
	FROM Clinician C
	INNER JOIN ClinicianToPatient L ON (L.ClinicianID = C.SHSCID)
	INNER JOIN Patient P ON (L.PatientID = P.MedicalRecordNum)
    WHERE P.MedicalRecordNum='$query'
	ORDER BY C.SHSCID";
	if ($result = $mysqli->query($q)){
		while($row = $result->fetch_assoc())     
		{
			$bus = array(
				'SHSCID' => $row['SHSCID'],
			);
			array_push($json, $bus);
		}
		$result->free();
	}//end query
	$jsonstring = json_encode($json);
	return $jsonstring;
}//end getClinician

function getQuestionnaireSettings($query){
	//Create JSON array to return all values
	$json = array();
	
	global $mysqli;
	$q = "SELECT *
	FROM QuestionnaireSettings
	WHERE PatientID='$query'";
	if ($result = $mysqli->query($q)){
		//Only one row should be returned
		$row = $result->fetch_assoc();
		
		date_default_timezone_set('America/Toronto');
		$currentDate = strtotime(date("Y-m-d"));		//returns Unix timestamp of today
		$startDate = strtotime($row['StartDate']);	//returns Unix timestamp of survey start date
   	 	
		//Infrequent items administered next on...
		if ($currentDate > $startDate){
			$weeksDiff = $currentDate - $startDate;
			$weeksDiff = ceil($weeksDiff/(60*60*24*$row['LongFormFrequency'])); //return number of long form sessions, rounded upwards
			$nextDate = $startDate + ($weeksDiff)*$row['LongFormFrequency']*24*60*60;
			//convert nextDate to year month day format
			$nextDate = date ("Y-m-d", $nextDate);
		}
		else{
			$nextDate = date ("Y-m-d", $startDate);
		}
		
		$json = array(
				'ShortFormFrequency' => $row['ShortFormFrequency'],
				'LongFormFrequency' => $row['LongFormFrequency'],
				'Reminder' => $row['Reminder'],
				'ReminderMax' => $row['ReminderMax'],
				'ReminderFrequency' => $row['ReminderFrequency'],
				'RandomizeQuestions' => $row['RandomizeQuestions'],
				'RandomizeVASAnchors' => $row['RandomizeVASAnchors'],
				'StartDate' => $nextDate);
		$result->free();
		//New query for each session time from separate table
		//$q = "SELECT * FROM QuestionnaireTimes WHERE PatientID='$query' ORDER BY Time DATE_FORMAT(NOW(), '%k:%i') ";
	}//end query
	
	$q = "SELECT Time,
	DATE_FORMAT(Time, '%H:%i') AS formattedTime
	FROM QuestionnaireTimes
	WHERE PatientID='$query' AND ReminderTime='0'
	ORDER BY Time";
	if ($result = $mysqli->query($q)){
		$i = 1;
		while($row = $result->fetch_assoc()){
			$json['Time'.$i] = $row['formattedTime'];
			$i++;
		}
		$result->free();
	}//end query
	
	//Another new query for questionnaire settings
	$q = "SELECT *
	FROM PatientToQuestions
	WHERE PatientID='$query'
	ORDER BY QuestionID";
	if ($result = $mysqli->query($q)){
		$i = 1;
		while($row = $result->fetch_assoc()){
			
			$json[$row['QuestionID']] = $row['Include'];
			$json[$row['QuestionID'].'_Infreq'] = $row['Infreq'];
			$i++;
		}
		$result->free();
	}//end query
	
	//Put entire array into first element of output
	$output[] = $json;
	
	$jsonstring = json_encode($output);
	return $jsonstring;
}//end getQuestionnaireSettings
?>