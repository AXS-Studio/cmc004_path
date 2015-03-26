<?php
/**
 * create_patient.php
 * Adds and edits clinician account details in database
 * Sends back JSON array indicating error or success
 * Called from patient.php
 * adapted from http://evolt.org/php_login_script_with_remember_me_feature
 */

session_start();
require_once("database.php");
require_once("password_hash.php");

//Add new user into database, returns "success" or appropiate error message
function addNewUser($clinicianID,$MedicalRecordNum,$FirstName,$LastName,$Email,$Password, $PhoneNum, $PhoneCarrier, $Enabled){
	global $mysqli;
	$Password = "password"; //temporary: set intial password to password
	$Password = create_hash($Password);
 	$result = true; 		//Track error
	
	//--Add new entry for Patient table--
	if ($stmt = $mysqli->prepare("INSERT INTO `Patient`(`MedicalRecordNum`, `FirstName`, `LastName`, `Email`, `Password`, `PhoneNum`, `PhoneCarrier`, `Enabled`) VALUES (?,?,?,?,?,?,?,?)")){
   	
	$stmt->bind_param('sssssssi', $MedicalRecordNum, $FirstName, $LastName, $Email, $Password, $PhoneNum, $PhoneCarrier, $Enabled);	//Bind our param as string
		
	$result = $stmt->execute();			//Execute the prepared Statement   	
	if (!$result)
   	return $mysqli->error; //Duplicate key error is $mysqli->errrno == 1062
	}
	
	//--Create default questionnaire settings for new patient, with different MRN and StartDate (set to today)--
	//date_default_timezone_set('America/Toronto');
	$now = date("Y-m-d");
	
	$q = "INSERT INTO `QuestionnaireSettings`
	(`PatientID`, `ShortFormFrequency`,`LongFormFrequency`,`Reminder`, `ReminderMax`, `ReminderFrequency`, `RandomizeQuestions`, `RandomizeVASAnchors`, `StartDate`)
	SELECT '$MedicalRecordNum' , `ShortFormFrequency` , `LongFormFrequency` , `Reminder`, `ReminderMax`, `ReminderFrequency`,
	`RandomizeQuestions` , `RandomizeVASAnchors` , '$now'
	FROM `QuestionnaireSettings`
	WHERE `PatientID` = 'Default'";
	$result = $result && $mysqli->query($q);
   
	//--Create default session times for new patient--
	$q = "INSERT INTO `QuestionnaireTimes` (`PatientID`, `Time`)
 	SELECT '$MedicalRecordNum', `Time`
 	FROM `QuestionnaireTimes`
 	WHERE `PatientID` = 'Default'";
 	$result = $result && $mysqli->query($q);
   
   //--Create default question set for new patient--
   $q = "INSERT INTO `PatientToQuestions`(`PatientID`, `QuestionID`, `Include`, `Infreq`) 
   SELECT '$MedicalRecordNum', `QuestionID`, `Include`, `Infreq`
   FROM `PatientToQuestions`
   WHERE `PatientID` = 'Default'";
   $result = $result && $mysqli->query($q);
    
	//--Assign patient to current clinician--
   $q = "INSERT INTO ClinicianToPatient VALUES ('$clinicianID', '$MedicalRecordNum')";
   $result = $result && $mysqli->query($q);
	
	if ($result)  
	return "success";
	else
	return $mysqli->error;
}//end addNewUser

//Update user in database, returns "success" or appropiate error message
function updateUser($OldMedicalRecordNum,$MedicalRecordNum,$FirstName,$LastName,$Email, $Password, $PhoneNum, $PhoneCarrier, $Enabled){
	
	global $mysqli;
	$result = true;
	
	//Database checks if MRN/ID is unique		
	if ($stmt = $mysqli->prepare("UPDATE `Patient` SET `MedicalRecordNum`=?,`FirstName`=?,`LastName`=?,`Email`=?,
		`PhoneNum`= ?,`PhoneCarrier` = ?,`Enabled` = ? WHERE `MedicalRecordNum` = ?")){
   	
	$stmt->bind_param('ssssssis', $MedicalRecordNum, $FirstName, $LastName, $Email, $PhoneNum, $PhoneCarrier, $Enabled, $OldMedicalRecordNum);	//Bind our param as string
	$result = $stmt->execute();			//Execute the prepared Statement   	
	
	if (!$result)
   	return $mysqli->error; //Duplicate key error is $mysqli->errrno == 1062
	}	
		
	//Need to update all other databases too
	$q= "UPDATE `ClinicianToPatient` SET `PatientID`='$MedicalRecordNum' WHERE `PatientID`= '$OldMedicalRecordNum'";
	$result = $result && $mysqli->query($q);
	$q= "UPDATE `PatientToQuestions` SET `PatientID`='$MedicalRecordNum' WHERE `PatientID`= '$OldMedicalRecordNum'";
	$result = $result && $mysqli->query($q);
	$q= "UPDATE `QuestionnaireSettings` SET `PatientID`='$MedicalRecordNum' WHERE `PatientID`= '$OldMedicalRecordNum'";
	$result = $result && $mysqli->query($q);
	$q= "UPDATE `QuestionnaireTimes` SET `PatientID`='$MedicalRecordNum' WHERE `PatientID`= '$OldMedicalRecordNum'";
	$result = $result && $mysqli->query($q);
			
	if ($result)
	return "success";
	else
	return $mysqli->error;
}//end updateUser

//returns true or false
function deleteUser($username){
	global $mysqli;
	$result = true;
	$q = "DELETE FROM `Patient` WHERE `MedicalRecordNum` = '$username'";
	$result = $mysqli->query($q);
	$q = "DELETE FROM `ClinicianToPatient` WHERE `PatientID` = '$username'";
	$result = $result && $mysqli->query($q);	
	$q = "DELETE FROM `PatientToQuestions` WHERE `PatientID` = '$username'";
	$result = $result && $mysqli->query($q);
	$q = "DELETE FROM `QuestionnaireSettings` WHERE `PatientID` = '$username'";
	$result = $result && $mysqli->query($q);
	$q = "DELETE FROM `QuestionnaireTimes` WHERE `PatientID` = '$username'";
	$result = $result && $mysqli->query($q);;
	
	return $result;
}

//----------------------------------------------------------------------
//POST action
if(isset($_POST['subCreatePatientAccount']) || isset($_POST['subEmailPatientAccount'])){
	
	//$userID = $_POST['UserID'];
	$userID = $_SESSION['userName'];
	$oldPatientID = $_POST['PatientDropdown'];
	$patientID = $_POST['MedicalRecordNum'];//eg. Record01
	$firstName = $_POST['FirstName'];
	$lastName = $_POST['LastName'];
	$name = $_POST['FirstName'].' '.$_POST['LastName'];
	$email = $_POST['Email'];
	$password = $_POST['Password'];
	$phoneNum = $_POST['PhoneNum'];
	$phoneCarrier = $_POST['PhoneCarrier'];
	$enabled=$_POST['Enabled']; //eg. 0 or 1
	
	//if ($enabled == 'on')
	//$enabled = 1;
	
	
	//Return error success messages as JSON
	$myResponse = array();
	
	$phoneNum = intval($phoneNum);
	$enabled = intval($enabled);
		
	//If patient needs to be emailed, create a new nonce
	if (isset($_POST['subEmailPatientAccount'])){
		$randomNonce = uniqid();
		date_default_timezone_set('America/Toronto');
		$now = date(DATE_ISO8601);
		
		//Delete nonce from database if existing
		$q = "DELETE FROM `Nonce_MHT` WHERE `Email` = '$email'";
		$result = $mysqli->query($q);
		
		$q = "INSERT INTO `Nonce_MHT`(`Email`, `Nonce`, `Date`)
		VALUES ('$email','$randomNonce','$now')";
		
		if ($mysqli->query($q)){
			$myResponse['n'] = $randomNonce;
		}
		else{
			$myResponse['message'] = "Error: Problem writing to database";
		}
	}
	
	//Check if MRN is already in use
   if($oldPatientID =='Create New')
   {	
		//$myResponse['message'] = "Error: MRN <strong>$patientID</strong> is already in the database";
		$result = addNewUser($userID, $patientID,$firstName,$lastName,$email,$password, $phoneNum, $phoneCarrier, $enabled);
		
		if ($result == "success")
		{
			$myResponse['message'] = "Successfully entered <strong>$name</strong> in database";
			logActivity($userID, "Added patient $name ($patientID)");
		}
		else
		{
			$myResponse['message'] = "Error: ".$result;
			logActivity($userID, "Database error: ".$result);
		}
		echo json_encode($myResponse);
		$mysqli->close();
		exit();
   }//end if($oldPatientID =='Create New')
   else
   {
		//Update user
		$result = updateUser($oldPatientID, $patientID,$firstName,$lastName,$email,$password, $phoneNum, $phoneCarrier, $enabled);
		
		if ($result == "success")
		{
			$myResponse['message'] = "Successfully updated <strong>$name</strong> in database";
			logActivity($userID, "Updated patient $name ($patientID)");
		}//end if
		else
		{
			$myResponse['message'] = "Error: ".$result;
			logActivity($userID, "Database error: ".$result);
		}//end else
		echo json_encode($myResponse);
		$mysqli->close();
		exit();
   }//end PatientDropdown!="Add New"
}//end POST action

//POST action
if(isset($_POST['subDeletePatientAccount']))
{
	//$userID = $_POST['UserID'];
	$userID = $_SESSION['userName'];
	$patientID = $_POST['MedicalRecordNum'];
	$name = $_POST['FirstName'].' '.$_POST['LastName'];
	
	if (!deleteUser($patientID))
	{
		$myResponse['message'] = "Error: Problem writing to database"; 
		logActivity($userID, "Database error: Deleting patient $name ($patientID)");
	}
	else
	{
		$myResponse['message'] = "<strong>$name</strong> deleted from database";
		logActivity($userID, "Deleted patient $name ($patientID)");
	}
	echo json_encode($myResponse);
	$mysqli->close();
	exit();
}
?>