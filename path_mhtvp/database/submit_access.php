<?php
/* edit_access.php
 * Edits access privileges for clinicians to patients
 * by assigning patients to clinicians and vive versa
 */

session_start();
require_once("database.php");
global $mysqli;
/*POST action from "Revert Changes" - Now handled in Javascript
if(isset($_POST['subRevert'])){
	header("Location: access.php");
}*/

//POST action
if(isset($_POST['subEditAccess'])){
	//$userID = $_POST['UserID'];
	$userID = $_SESSION['userName'];
	$patientChecklist = $_POST['PatientChecklist'];
  	$clinicianID = $_POST['ClinicianDropdown'];
	$clinicianChecklist = $_POST['ClinicianChecklist'];
	$patientID = $_POST['PatientDropdown'];
	$result = true;
	
	//If assigning patients to clinicians
	if ($clinicianID != "Select" && $patientID == "Select")
	{
		//First delete all entires related to that doctor
		$q = "DELETE FROM ClinicianToPatient WHERE ClinicianID = '$clinicianID'";
  		$result = $mysqli->query($q);
		
		if(empty($patientChecklist)){
    		//echo("You didn't select any patients.");
  		}
 		else{
			$numPatients = count($patientChecklist);
			
			for($i=0; $i < $numPatients; $i++){
				$q = "INSERT INTO ClinicianToPatient VALUES ('$clinicianID', '$patientChecklist[$i]')";
				$result = $result && $mysqli->query($q);
			}
  			logActivity($userID, "Assignment updated for $clinicianID");
		}//end else	
	}//end if $clinicianID...
	else if ($clinicianID == "Select" && $patientID != "Select")
	{
		//First delete all entries related to that patient
		$q = "DELETE FROM ClinicianToPatient WHERE PatientID = '$patientID'";
  		$result = $mysqli->query($q);
		
		if(empty($clinicianChecklist)){
    		//echo("You didn't select any clinicians.");
  		}
		else{
			$numClinicians = count($clinicianChecklist);
			
			for($i=0; $i < $numClinicians; $i++){
				$q = "INSERT INTO ClinicianToPatient VALUES ('$clinicianChecklist[$i]', '$patientID')";
				$result = $result && $mysqli->query($q);
			}
			logActivity($userID, "Assignment updated for $patientID");
		}//end else
	}//end else if $clinicianID...
	if ($result){
		$myResponse['message'] = "Assignment updated"; 
	}
	else{
		$myResponse['message'] = "Assignment unsuccessful, database error"; 
		logActivity($userID, "Database error: Assignment unsuccessful");
	}
	echo json_encode($myResponse);
	
	$mysqli->close();
	exit();
}