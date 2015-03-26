<?php
/* Cron command to use
php public_html/website/client/DrKreindler/path/database/cron.php >/dev/null 2>&1
*/
require_once("database.php");
require_once('EmailText.php');

define("WINDOW_MINUTES", 30);

//----------Automated Tasks --------------------------------------------------
//1. Send questionnaire reminders (Email)
function sendEmail($email){
	$to = $email;
	$subject = "Hello";
	$body = EmailText::REMINDER;
	$headers = EmailText::getHeader();
	//return mail($to, $subject, $body, $headers);
}

//1. Send questionnaire reminders (SMS via clickatell)
function sendSMS($phoneNum){

	$message= urlencode(EmailText::REMINDER);
	$url = "http://api.clickatell.com/http/sendmsg?user=PATH-MOD&password=V1su@l1ze!&api_id=3421842&MO=1&from=15134881547&to=1".$phoneNum."&text=".$message;
	$ret = file($url);
	$send = explode(":",$ret[0]);
 
	if ($send[0] == "ID") {
		echo "message ID: ". $send[1]." ";
		return 1;
	} else {
		echo "message failed ".$send[0]." ".$send[1]." ";
		echo $url." ";
		return 0;
	}
	
	/*For reference: Sample code from Clickatell website
		
	$user = "david.kreindler";
    $password = "V1su@l1ze!";
    $api_id = "3421842";
    $baseurl ="http://api.clickatell.com";
 
    $text = urlencode("This is an example message");
    $to = "00123456789";
 
    // auth call
    $url = "$baseurl/http/auth?user=$user&password=$password&api_id=$api_id";
 
    // do auth call
    $ret = file($url);
 
    // explode our response. return string is on first line of the data returned
    $sess = explode(":",$ret[0]);
    if ($sess[0] == "OK") {
 
        $sess_id = trim($sess[1]); // remove any whitespace
        $url = "$baseurl/http/sendmsg?session_id=$sess_id&to=$to&text=$text";
 
        // do sendmsg call
        $ret = file($url);
        $send = explode(":",$ret[0]);
 
        if ($send[0] == "ID") {
            echo "successnmessage ID: ". $send[1];
        } else {
            echo "send message failed";
        }
    } else {
        echo "Authentication failure: ". $ret[0];
    }
	*/
}

function sendReminders(){
	date_default_timezone_set('America/Toronto');
	$now = date('H:i:00');
	//$now = date('09:00:00'); //For debugging
	
	//Get a list of users who are supposed to do survey NOW
	$patientArray = array();
	$phoneArray = array();
	global $mysqli;
	
	//Set database timezone correctly (only for axs3d server, sunnybrook.ca is default to Toronto time)
	//$q = "SET SESSION time_zone = '-4:00'";
	//$mysqli->query($q);
	//Code to check if database timezone is set correctly
	//$result = $mysqli->query("SELECT CURTIME()");
	//print_r( $result->fetch_assoc());
				
	//Select patients where questionniare time is now, is enabled and reminders are turned on
	$q = "SELECT `MedicalRecordNum`,`Email`,`PhoneNum`,`PhoneCarrier` FROM `Patient`
	INNER JOIN `QuestionnaireTimes` ON `QuestionnaireTimes`.`PatientID` = `Patient`.`MedicalRecordNum`
	INNER JOIN `QuestionnaireSettings` ON `QuestionnaireSettings`.`PatientID` = `Patient`.`MedicalRecordNum`
	WHERE `QuestionnaireTimes`.`Time` = '$now' AND  `Patient`.`Enabled` = 1 AND `QuestionnaireSettings`.`Reminder` = 1";
	
	if ($users = $mysqli->query($q)){
		while($user = $users->fetch_assoc()){
			
			//Assign variables
			$patientID = $user['MedicalRecordNum'];
			$email = $user['Email'];
			$phoneNum = $user['PhoneNum'];
			$phoneCarrier = $user['PhoneCarrier'];
			
			//Skip 'Default' user - skip the rest and return to condition evaluation of while loop
			if ($patientID == 'Default')
			continue;
					
			//For each patient, let's check if they have already done their survey within last 30 minutes
			
			//Original snippet: Check if user has logged in within WINDOW_MINUTES allowance
			//$q = "SELECT `Date` FROM `Sessions_MHT` WHERE `PatientID` = '$patientID' AND `Date` > NOW() - INTERVAL ".WINDOW_MINUTES." MINUTE";  
			//Current snippet: Check if user has logged in within today
			$q = "SELECT `Date` FROM `Sessions_MHT` WHERE `PatientID` = '$patientID' AND DATE(`Date`) = DATE(NOW())";
			$result = $mysqli->query($q);
			
			if ($result->num_rows >= 1){
				//echo "not sending message out to $patientID at $email as they have done survey within ".WINDOW_MINUTES." minutes<br>";
				echo date("Y-m-d H:i:s")." not sending message out to $patientID at $phoneNum as survey started today already\r\n";
				$result->free();
				continue;
			}
			
			//case 2: user hasn't done survey since last reminder...send reminder to do survey NOW
			//case 3: user hasn't done surveys ever...send reminder to do survey NOW
			//Add users to array lists to send out reminders in one go
			$phoneArray[] = $phoneNum;
			$patientArray[] = $patientID;
			
		}//end while loop
		$users->free();
	}//end query
	
	//Send out SMS reminders if available
	if (!$phoneArray)
	return;
	
	for($i=0; $i<sizeof($phoneArray); $i++) {
		echo date("Y-m-d H:i:s")." sending message out to $patientID at $phoneNum: ";
		$result = sendSMS($phoneArray[$i]);
		if ($result){
			echo " success\r\n";
			logMHTActivity($patientArray[$i], "Sent SMS reminder");
		}
		else{
			echo " unsuccessful\r\n";
			logMHTActivity($patientArray[$i], "SMS unsuccessful");
		}
	}//end for loop
}//end sendReminders()

//----------------------------------------------------------------------------
//2. Temporary Password Maintenance
function deleteOldNonces(){
	echo date("Y-m-d H:i:s")." Nonce maintenance\r\n";
	//Delete Nonces which are more than 30 days old
	global $mysqli;
	$q = "DELETE FROM `Nonce_MHT` WHERE `Date` < NOW() - INTERVAL 30 DAY";
  	$result = $mysqli->query($q);
	
	if ($result && $mysqli->affected_rows>0)
	echo "deleted ".$mysqli->affected_rows." rows\r\n";
	
	return $result;
}//end deleteOldNonces()

//-----Main Function-----------------------------------------------------------
//Run every minute
sendReminders();

//Run once a day
if (date( 'H') == 0 && date( 'i') == 0)
deleteOldNonces();

//Print out 
//$timestamp = date("Y-m-d H:i:s");
//echo $timestamp.": cron script executed.\n";

$mysqli->close();
exit();
//----------------------------------------------------------------------------
?>