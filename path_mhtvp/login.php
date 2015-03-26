<?php
/* login.php
* Displays log in form for user.
* Redirects to main page if user already logged in
*/ 
//Include Files
session_start(); 
include('database/submit_login.php');

//Redirect user if already logged in
if (checkLogin()) {
	header('Location: index.php');
	exit;
}

$title = 'Welcome to PATH-MHTV';

include('inc/head.inc.php');

if (isset($_SESSION['error'])) { 
	//Display alert if there is an error from logging in
	echo '<script>window.alert("' . $_SESSION['error'] . '");</script>';
	unset($_SESSION['error']);
}
?>
	<body class="login">
		<div id="wrapper">
			<header>
				<h1><strong>P</strong>hysician <strong>A</strong>ccess to <strong>T</strong>elemetry from <strong>H</strong>andhelds - MHTV</h1>
				<img src="images/logo_sunnybrook_research_institute.gif" alt="Sunnybrook Research Institute" width="189" height="47">
			</header>
			<div class="minHeight" id="mh">
				<article class="loginBox">
					<h2>Welcome to <strong>PATH-MHTV</strong></h2>
					<p class="alert o0" id="alert-user" style="display: none;">Your <strong>SHSC ID</strong> is incorrect. Please re-enter it.</p>
					<p class="alert o0" id="alert-pass" style="display: none;">Your <strong>password</strong> is incorrect. Please re-enter it.</p>
					<p class="alert o0" id="alert-dontMatch" style="display: none;">Your <strong>SHSC ID</strong> and <strong>password</strong> don’t match. Please try again.</p>
					<p class="alert o0" id="alert-clinician" style="display: none;"><strong>Clinician</strong> not found in PATH database.</p>
					<form id="login" method="post" action="database/submit_login.php">
						<fieldset>
							<input type="text" name="user" class="top" id="user" placeholder="SHSC ID">
							<input type="password" name="pass" class="bottom" id="pass" placeholder="Password">
							<!-- <div class="fRight">
								<input type="checkbox" name="remember" id="remember">
								<label for="remember">Remember me</label>
							</div>
							end fRight -->
							<input type="button" name="sublogin" id="sublogin" value="Login">
						</fieldset>
					</form>
					<!-- end login -->
					<!-- <p class="forgot"><a href="#" title="Forgot ID/password?" id="btnForgot">Forgot ID/password?</a></p> -->
				</article>
				<!-- end loginBox -->
			</div>
			<!-- end minHeight -->
<?php
include('inc/footer.inc.php');
?>
		</div>
		<!-- end wrapper -->
<?php
include('inc/scripts.inc.php');
?>
		<script>
			$(document).ready(function() {
				$('html').removeClass('no-js').addClass('js');
				// MinHeight.init();
				LoginFooter.init();
				NicePlaceholder.init();
				FormValidation.login();
			});
		</script>
	</body>
</html>