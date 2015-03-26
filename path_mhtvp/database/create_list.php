<?php
/**
 * create_list.php
 * Functions to populate drop down lists
 * Called from access.php, questionnaire.php
 */
 
session_start();
require_once("database.php");

global $mysqli;
$retrieve=$_GET["retrieve"];
	
//Obtain parameters to be searched and required results
if (isset($_GET["retrieve"]))
{	
	switch($retrieve){
	  case 'patientList':
		createPatientDropdownOptionsHideDefault();
	  break;
	  case 'clinicianList':
		createClinicianDropdownOptions();
	  break;
	  case 'patientListQueryAnswersInitial':
		createPatientDropdownOptionsQueryAnswersInitial();
	  break;
	  default:
		echo json_encode(array('err'=>'unknown method'));
	  break;
	}
	$mysqli->close();
	exit;
}

function createClinicianDropdownOptions() {
	$dropdown = "";
	global $mysqli;
	$q = "SELECT SHSCID, CONCAT(LastName, ', ',FirstName) AS FullName FROM Clinician ORDER BY FullName";
	if ($result = $mysqli->query($q)){
		//Add in database entires
		while($row = $result->fetch_assoc()) {
		  $dropdown .= "\r\n<option value='{$row['SHSCID']}'>{$row['FullName']}</option>";
		}
	$result->close();
	}//end query
	echo $dropdown;
	return;
}

//Creates dropdown lost of patients assigned to clinician
function createPatientDropdownOptionsHideDefault(){
	$dropdown = "";
	global $mysqli;
	$clinician = $_SESSION["userName"];
	
	if ($clinician!=""){
	$q = "SELECT P.MedicalRecordNum, CONCAT(P.LastName, ', ',P.FirstName) AS FullName
	FROM Patient P
	INNER JOIN ClinicianToPatient L ON (L.PatientID = P.MedicalRecordNum)
	INNER JOIN Clinician C ON (L.ClinicianID = C.SHSCID)
    WHERE C.SHSCID='$clinician'
	ORDER BY FullName";
	}
	else{
	$q = "SELECT MedicalRecordNum, CONCAT(LastName, ', ',FirstName) AS FullName FROM Patient ORDER BY FullName";
	}
	
	if ($result = $mysqli->query($q)){
		//Add in database entires
		while($row = $result->fetch_assoc()) {
		  $dropdown .= "<option value='{$row['MedicalRecordNum']}'>{$row['FullName']}</option>";
		}
	$result->close();
	}//end query
	echo $dropdown;
	return;
}

//Variation of above, where 'Default' account is shown
function createPatientDropdownOptions(){
	$dropdown = "";
	$dropdown .= "<option value='Default'>--Default--</option>";
	
	global $mysqli;
	$clinician=$_SESSION["userName"];
	
	if ($clinician!=""){
	$q = "SELECT P.MedicalRecordNum, CONCAT(P.LastName, ', ',P.FirstName) AS FullName
	FROM Patient P
	INNER JOIN ClinicianToPatient L ON (L.PatientID = P.MedicalRecordNum)
	INNER JOIN Clinician C ON (L.ClinicianID = C.SHSCID)
    WHERE C.SHSCID='$clinician'
	ORDER BY FullName";
	}
	else{
		$q = "SELECT MedicalRecordNum, CONCAT(LastName, ', ',FirstName) AS FullName FROM Patient ORDER BY FullName";
	}
	if ($result = $mysqli->query($q)){
		//Add in database entires
		while($row = $result->fetch_assoc()) {
		  $dropdown .= "<option value='{$row['MedicalRecordNum']}'>{$row['FullName']}</option>";
		}
	$result->close();
	}//end query
	echo $dropdown;
	return;
}

function createClinicianChecklist() {
	$output = '';
	global $mysqli;
	$q = "SELECT SHSCID, CONCAT(LastName, ', ',FirstName) AS FullName FROM Clinician ORDER BY FullName";
	if ($result = $mysqli->query($q)){
		while($row = $result->fetch_assoc()){	// ALERT: This is the code that creates the clinician check lists:
		$output .= "<div class='row'><input type='checkbox' name='ClinicianChecklist[]' id='" . $row['SHSCID'] . "' value='" . $row['SHSCID'] . "'><label for='" . $row['SHSCID'] . "'>" . $row['FullName'] . "</label></div>";
		}
	$result->close();
	}//end query
	echo $output;
	return;
}

function createPatientChecklist() {
	$output = '';
	global $mysqli;
	$q = "SELECT MedicalRecordNum, CONCAT(LastName, ', ',FirstName) AS FullName FROM Patient ORDER BY FullName";
	if ($result = $mysqli->query($q)){
		while($row = $result->fetch_assoc()){
		if ($row['MedicalRecordNum'] != 'Default')	// ALERT: This is the code that creates the clinician check lists:
		$output .= "<div class='row'><input type='checkbox' name='PatientChecklist[]' id='" . $row['MedicalRecordNum'] . "' value='" . $row['MedicalRecordNum'] . "'><label for='" . $row['MedicalRecordNum'] . "'>" . $row['FullName'] . "</label></div>";
		}
	$result->close();
	}//end query
	echo $output;
	return;
}

function createPatientDropdownOptionsQueryAnswersInitial(){
	$dropdown = "";
	global $mysqli;
	$clinician = $_SESSION["userName"];
	
	if ($clinician!=""){
	$q = "SELECT P.MedicalRecordNum, CONCAT(P.LastName, ', ',P.FirstName) AS FullName
	FROM Patient P
	INNER JOIN ClinicianToPatient L ON (L.PatientID = P.MedicalRecordNum)
	INNER JOIN Clinician C ON (L.ClinicianID = C.SHSCID)
    WHERE C.SHSCID='$clinician'
	ORDER BY FullName";
	}
	else{
	$q = "SELECT MedicalRecordNum, CONCAT(LastName, ', ',FirstName) AS FullName FROM Patient ORDER BY FullName";
	}
	
	if ($result = $mysqli->query($q)){
		//Add in database entires
		while($row = $result->fetch_assoc()) {
		  # $dropdown .= "<option value='database/query_answers_initial.php?patientID={$row['MedicalRecordNum']}'>{$row['FullName']}</option>";
		  $dropdown .= "<option value='database/query_answers_initial.php?patientID={$row['MedicalRecordNum']}'>{$row['FullName']}</option>";
		}
	$result->close();
	}//end query
	echo $dropdown;
	return;
}
?>