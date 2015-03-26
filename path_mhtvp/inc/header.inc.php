<?php
require_once('database/database.php');
include('database/submit_login.php');
if (!checkLogin()) {
	echo '<META HTTP-EQUIV="Refresh" Content="0; URL=login.php">';
}

$uri = explode('/', $_SERVER['REQUEST_URI']);
$uriLength = count($uri);
$page = $uri[$uriLength - 1];

?>
<header>
			<script>
			var formChanged = false; //Flags changes made to form (detects changes on <input> value)
			
			//Check if there are unsaved changes, obtain confirmation from user
            function menuClicked(sel) {
				if (formChanged == true) {
					var confirmation = confirm("There are unsaved changes, do you wish to proceed anyway?");
					if (confirmation == false) {
						sel.selectedIndex = 0;
						return;
					}
				}
				window.location.replace(sel.options[sel.selectedIndex].value);
			}
			
            </script>
			<h1><strong>PATH-MHTV</strong></h1>
			<form>
				<label>Welcome <?php
if (checkAdmin()) 
	$admin = true;

print $_SESSION['firstName'];
if (checkAdmin()) 
	print' (admin)';
				?></label>
				<select name="menu" id="menu" onchange="menuClicked(this);">
					<option value=""<?php
if ($page == 'terms.php') {
	echo ' selected="selected"';
}
					?>>--Select--</option>
					<option value="index.php"<?php
if ($page == 'index.php') {
	echo ' selected="selected"';
}
					?>>View patient data</option>
<?php
if ($admin) {
	echo '<option value="clinician.php"';
	if ($page == 'clinician.php') {
		echo ' selected="selected"';
	}
	echo '>Create/edit clinician account</option>';
}
?>
					
					<option value="patient.php"<?php
if ($page == 'patient.php') {
	echo ' selected="selected"';
}
					?>>Create/edit patient account</option>
<?php
if ($admin) {
	echo '<option value="access.php"';
	if ($page == 'access.php') {
		echo ' selected="selected"';
	}
	echo '>Assign clinician-patient access</option>';
}
?>
					
					<option value="questionnaire.php"<?php
if ($page == 'questionnaire.php') {
	echo ' selected="selected"';
}
					?>>Customize patient questionnaire</option>
				</select>
				<a href="logout.php" title="logout">logout</a>
			</form>
			<img src="images/logo_sunnybrook_research_institute.gif" alt="Sunnybrook Research Institute" width="189" height="47">
		</header>
