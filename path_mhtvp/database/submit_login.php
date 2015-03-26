<?php
/**
 * submit_login.php
 * Checks against sunnybrook LDAP database for authetication
 * Sends back JSON array indicating error or success
 * Called from login.php
 */
 
session_start();
require_once("database.php");
 
 //JSON return values for $myResponse['result']
 //0 === Invalid database query credentials, please contact admin
 //2 === Clinician not found in PATH database
 //3 === Invalid Sunnybrook SHSC password
 //4 === Invalid Sunnybrook SHSC ID
if(isset($_REQUEST['user']) && isset($_REQUEST['pass'])){
	
	$userName = $_REQUEST['user'];
	$password = $_REQUEST['pass'];
	
	//Kill session variables
	unset($_SESSION['login']);
	unset($_SESSION['userName']);
	unset($_SESSION['firstName']);
	
	//Authenticate in LDAP
	$ldap = ldap_connect($ldapServer);
	$bind = ldap_bind($ldap, $ldapGeneralUser, $ldapGeneralPassword);	

	if ($bind){
		//First bind finds the DN for the clinician based on their SHSCID (samaccountname)
		$results = ldap_search($ldap, $ldapDN, "samaccountname=".$userName);		
		$data = ldap_get_entries($ldap, $results);		
		
		if ( $data[0]){
			// If sucessful, re-bind using the distinguished name found in the search
			$bind2 = @ldap_bind($ldap, $data[0]['dn'], $password);
			
			if($bind2) {
				//LDAP authetication successful, now check PATH database
				global $mysqli;
				if ($stmt = $mysqli->prepare("SELECT `FirstName` FROM `Clinician` WHERE `SHSCID` = ?")){
					$stmt->bind_param('s', $userName);	//Bind our param as string
					$stmt->execute();					//Execute the prepared Statement
					$stmt->bind_result($firstName); 	//Bind result
					$stmt->fetch();
					if (empty($firstName)){
						//Clinician in LDAP but not in PATH database
						$stmt->close();	// Close the statement					
						logActivity($userName, "Login fail: Clinician not found");
						$myResponse['result'] = 2; //2 === Clinician not found in PATH database
						echo json_encode($myResponse);
					}
					else{
						//PATH authentication successful
						 $_SESSION['login'] = true;
						 $_SESSION['firstName'] = $firstName;
						 $_SESSION['userName'] = $userName;
						
						$stmt->close();	// Close the statement
						logActivity($_SESSION['userName'], "Logged into PATH");
						
						//echo '<META HTTP-EQUIV="Refresh" Content="0; URL=../main.php">';
						//header("Location: ../main.php");
						$myResponse['result'] = 1; //1 === Login successful
						echo json_encode($myResponse);
					}
					
				}//end prepared statement
			}//end second ldap bind
			else{
				//LDAP Password incorrect
				$myResponse['result'] = 3; //3 === Invalid Sunnybrook SHSC password
				echo json_encode($myResponse);
			}
		}//end if ($data[0])
		else{
			$myResponse['result'] = 4; //4 === Invalid Sunnybrook SHSC ID
			echo json_encode($myResponse);
		}
	}//end first ldap bind
	else{
		//ldap authentication not successful
		$myResponse['result'] = 0; //0 === Invalid database query credentials, please contact admin
		echo json_encode($myResponse);
	}
	ldap_unbind($ldap);
	exit;
}//end check if(isset...

//Check if clinician is logged in
function checkLogin(){
	if(isset($_SESSION['login']) && isset($_SESSION['firstName']) &&  isset($_SESSION['userName'])){
		return true;
	}
	else{
		return false;
	}
}//end checkLogin()

//Check if clinician is an admin
function checkAdmin(){
	if(isset($_SESSION['userName'])){
		
		$userName = $_SESSION['userName'];
		global $mysqli;
		
		if ($stmt = $mysqli->prepare("SELECT `Admin` FROM `Clinician` WHERE `SHSCID` = ?")){
			$stmt->bind_param('s', $userName);	//Bind our param as string
			$stmt->execute();					//Execute the prepared Statement
			$stmt->bind_result($admin); 		//Bind result
			$stmt->fetch();
			$stmt->close();
			if (empty($admin)){
				return false;
			}
			else{
				if ($admin)
				return true;
				else if (!$admin)
				return false;
			}
			
		}//end prepared statement
	}//end if isset userName
	exit;
}//end checkAdmin()
?>
