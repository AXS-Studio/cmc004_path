<?php
/* logout.php
 * Provides functions to log user out and clear session data
 */
 
//Include files
session_start();
include("database/submit_login.php");

if(!checkLogin()){
   header("Location: login.php");
   //echo "<h1>Error!</h1>\n";
   //echo "You are not currently logged in, logout failed. Back to <a href=\"login.php\">login</a>";
}
else{
   logActivity($_SESSION['userName'], "Logged out");
   
   /* Kill session variables */   
   unset($_SESSION['login']);
   unset($_SESSION['userName']);
   unset($_SESSION['firstName']);
   
   $_SESSION = array(); // reset session array
   session_destroy();   // destroy session.
	
	header("Location: login.php");
	
   //echo "<h1>Logged Out</h1>\n";
   //echo "You have successfully <b>logged out</b>. Back to <a href=\"login.php\">log in</a>";
}

?>