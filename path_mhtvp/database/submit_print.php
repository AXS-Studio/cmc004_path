<?php
session_start();
/*if (empty($_SESSION['user'])) {
  die("Unauthorized.");
}*/

//-----Obtain raw html---------------------------------------------------------------
$html = $_POST["html"];
if (!isset($html)){
	//echo var_dump($_POST); //FOR DEBUG
	echo "Error - HTML generation. Please contact pathadmin@sunnybrook.ca";
	exit;
}

//-----Create html page locally---------------------------------------------------------------
//$filepath= $_SERVER['DOCUMENT_ROOT']."/path/database";
//$filename = "/screenshots/test.html";

$completeFilePath = $_SERVER['DOCUMENT_ROOT']."/path/database/screenshots/";
$relativeFilePath = "screenshots/";
$filename = uniqid('graph_', false); 

//str_replace('.', '_',uniqid())

if (!$handle = fopen($completeFilePath.$filename.'.html', 'w')) { 
	 //print_r( error_get_last()); //FOR DEBUG
	 echo "ERROR - Cannot open file ($filename). Please contact pathadmin@sunnybrook.ca"; 
	 exit; 
} 
if (fwrite($handle, $html) === false) { 
   echo "ERROR - Cannot write to file ($filename). Please contact pathadmin@sunnybrook.ca"; 
   exit; 
}

fclose($handle); 
 
//FOR DEBUG - Redirect the user to the html page 
//header("location: screenshots/test.html"); 

//-----Run phantomJS and ImageMagick Convert shell script to render PDF-----------------------
session_write_close();

$file = $relativeFilePath.$filename;
//Run phantomJS to screenshot local html page into png
$command = "sudo /usr/bin/phantomjs rasterize.js ".$file.".html ".$file.".png 2>&1 1> /dev/null";
$output = shell_exec($command);
//Run ImageMagick Convert to convert png into pdf
$command = "sudo convert ".$file.".png ".$file.".pdf 2>&1 1> /dev/null";
$output = shell_exec($command);

//-----Return pdf file to client---------------------------------------------------------------

header('Content-type: application/pdf');
header('Content-Disposition: attachment; filename="PATH_graphs.pdf"');
readfile( $file.".pdf");

//---if returning images---
//header('Content-type: image/jpg');
//header('Content-Disposition: attachment; filename="downloaded.jpg"');
//readfile('screenshots/test.jpg');
//-------------
//echo file_get_contents('test.pdf');

//-----Delete temporary files afterwards---------------------------------------------------------------
//Case for if user cancels file download

ignore_user_abort(true);
if (connection_aborted()) {
unlink($file.'.pdf');
unlink($file.'.png');
unlink($file.'.html');
}
//Case for normal download
unlink($file.'.pdf');
unlink($file.'.png');
unlink($file.'.html');

exit;
?>