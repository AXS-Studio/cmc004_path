<?php
/**
 * create_clinician.php
 * Adds and edits clinician account details in database
 * Sends back JSON array indicating error or success
 * Called from clinician.php
 * adapted from http://evolt.org/php_login_script_with_remember_me_feature
 */

session_start();
require_once("database.php");
require_once('EmailText.php');

//Add new user into database
function addNewUser($SHSCID,$FirstName,$LastName,$Email){
   global $mysqli;
   $result = true;
   $q = "INSERT INTO Clinician VALUES ('$SHSCID','$FirstName','$LastName','$Email', 0)";
   $result = $mysqli->query($q);
   
   if ($result)  
	return "success";
	else
	return $mysqli->error;
}//end addNewUser

//Update user in database
function updateUser($OldSHSCID,$SHSCID,$FirstName,$LastName,$Email){
		
	global $mysqli;
	$result = true;
	$q = "UPDATE `Clinician` SET `SHSCID`='$SHSCID',
			`FirstName`='$FirstName',`LastName`='$LastName',`Email`='$Email'
			 WHERE `SHSCID` = '$OldSHSCID'";	 
	$result = $mysqli->query($q);
	
	if (!$result)
   	return $mysqli->error; //Duplicate key error is $mysqli->errrno == 1062
				
	//Need to update all other databases too
	$q= "UPDATE `ClinicianToPatient` SET `ClinicianID`='$SHSCID' WHERE `ClinicianID`= '$OldSHSCID'";
	$result = $result && $mysqli->query($q);	

	if ($result)  
	return "success";
	else
	return $mysqli->error;
}//end updateUser

//Check if username is already in LDAP database
function usernameInvalid($username, $ldapServer, $ldapDN, $ldapGeneralUser, $ldapGeneralPassword){
	$username = addslashes($username);	
	
	//Authenticate in LDAP
	$ldap = ldap_connect($ldapServer);	
	$ldapBind = ldap_bind($ldap, $ldapGeneralUser, $ldapGeneralPassword);
	if ($ldapBind){
		$results = ldap_search($ldap, $ldapDN, "samaccountname=".$username);		
		$data = ldap_get_entries($ldap, $results);	
		//$data[0] = true;
		//print_r($username);		
		if ( $data[0]){
			return false;
		}
	}
	return true;
}

function deleteUser($username){
	global $mysqli;
	$result = true;
	
	$q = "DELETE FROM `Clinician` WHERE `SHSCID` = '$username'";
	$result = $mysqli->query($q);
	
	$q = "DELETE FROM `ClinicianToPatient` WHERE `ClinicianID` = '$username'";
	$mysqli->query($q); //Query will fail if no patients assigned to clinican (which is default)
	
	return $result;
}

function emailUser($to, $firstName){
	/*
	$subject = "Account created for Mental Health Telemetry";
	$body = "Dear $firstName,\n\n An account has been created for you on the SRI PATH Website http://path.sunnybrook.ca/login.\n\n Login using your SHSC ID and password.";
	$headers = 'From: pathadmin@sunnybrook.ca' . "\r\n" .
	'Reply-To: pathadmin@sunnybrook.ca' . "\r\n" .
	'X-Mailer: PHP/' . phpversion();
	*/
	$subject = EmailText::getSubject();
	$body = EmailText::getText(EmailText::NEW_CLINICIAN, array('FirstName' => $firstName));
	$headers = EmailText::getHeader();
	
	mail($to, $subject, $body, $headers);
}
//----------------------------------------------------------------------
//POST action
if(isset($_POST['subCreateClinicianAccount'])|| isset($_POST['subEmailClinicianAccount'])){
	
	//$userID = $_POST['UserID'];
	$userID = $_SESSION['userName'];
	$clinicianID = $_POST['SHSCID'];
	$firstName = $_POST['FirstName'];
	$lastName = $_POST['LastName'];
	$email = $_POST['Email'];
	$name = $_POST['FirstName'].' '.$_POST['LastName'];
	
	//Return error success messages as JSON
	$myResponse = array();
	
	//Adding a new account
	if($_POST['ClinicianDropdown']=='Create New')
	{
	   //Check if username is in Sunnybrook's LDAP database
	  
	  $result = usernameInvalid($clinicianID, $ldapServer, $ldapDN, $ldapGeneralUser, $ldapGeneralPassword);
	   if ($result){
		  $myResponse['message'] = "Error: SHSC ID <strong>$clinicianID</strong> not found in SHSC database ";
		  echo json_encode($myResponse);
		  $mysqli->close();
		  exit();
	   }
	  
	   $result = addNewUser($clinicianID,$firstName,$lastName,$email);
	   if ($result == "success")
	   {
			$myResponse['message'] = "Successfully added <strong>$name</strong> in database"; 
			logActivity($userID, "Added clinician $name ($clinicianID)");
			//emailUser($email, $firstName);
		}
		else{
			$myResponse['message'] = "Error: ".$result;
			logActivity($userID, "Database error: ".$result);
		}
		echo json_encode($myResponse);
		$mysqli->close();
		exit();
	}//end if($_POST['ClinicianDropdown']=='Create New')
	else{
		//Updating an account
		$result = updateUser($_POST['ClinicianDropdown'],$clinicianID,$firstName,$lastName,$email);
		if ($result == "success")
		{
			$myResponse['message'] = "Successfully updated <strong>$name</strong> in database"; 
			logActivity($userID, "Updated clinician $name ($clinicianID)");
		}//end if updateUser
		else{
			//Error probably due to duplicate SHSCID
			$myResponse['message'] = "Error: ".$result;
			logActivity($userID, "Database error: ".$result);
		}
		echo json_encode($myResponse);
		$mysqli->close();
		exit();
	}
}//end POST action

//POST action
if(isset($_POST['subDeleteClinicianAccount'])){
	//$userID = $_POST['UserID'];
	$userID = $_SESSION['userName'];
	$clinicianID = $_POST['SHSCID'];
	$name = $_POST['FirstName'].' '.$_POST['LastName'];
	
	if (deleteUser($clinicianID)){
		$myResponse['message'] = "<strong>$name</strong> deleted from database"; 
		logActivity($userID, "Deleted clinician $name ($clinicianID)");
	}
	else{
		$myResponse['message'] = "Error: problem writing to database"; 
		logActivity($userID, "Database error: Deleting clinician $name ($clinicianID)");
	}
	echo json_encode($myResponse);
	$mysqli->close();
	exit();
}
?>
