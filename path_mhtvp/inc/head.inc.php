<?php
/*
	For more PHP sniffing options to apply to the <html> element, visit the 
	following page: 
	http://www.killersites.com/community/index.php?/topic/2562-php-to-detect-browser-and-operating-system/
*/
$ua = $_SERVER["HTTP_USER_AGENT"];
?>
<!DOCTYPE html>
<!--[if lt IE 7]> <html class="no-js lt-ie9 lt-ie8 lt-ie7" lang="en"> <![endif]-->
<!--[if IE 7]>    <html class="no-js lt-ie9 lt-ie8" lang="en"> <![endif]-->
<!--[if IE 8]>    <html class="no-js lt-ie9" lang="en"> <![endif]-->
<!--[if IE 9]>	  <html class="no-js ie9" lang="en"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="en"> <!--<![endif]-->
	<head>
		<meta charset="utf-8">
		<title><?php echo $title; ?></title>
		<link rel="stylesheet" media="screen" href="css/style.css">
        <!-- <link rel="stylesheet" media="screen" href="css/style2.css"> -->
	</head>
	
