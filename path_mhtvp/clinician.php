<?php
/**
* clinician.php
* Add, edit and delete clinician accounts
*/
session_start();
 
$title = 'PATH-MHTV';

include('inc/head.inc.php');
?>
	<body>
<?php
include('inc/header.inc.php');
?>
		<div class="minHeight" id="mh">
			<article class="cedArt clinician" id="dw">
				<div class="cedfCont">
					<h2>Create/edit clinician account</h2>
					<form id="clinicianForm" method="post" action="database/submit_clinician.php" class="cedForm">
						<fieldset>
							<div class="row select">
								<select id="ClinicianDropdown" class="dropdown" name="ClinicianDropdown" onchange="ClinicianForm.clinicianDropdownChanged(this.value);">
								</select>
							</div>
							<!-- end row -->
							<p class="alert o0" id="alert-SHSCID" style="display: none;"><strong>SHSC ID</strong> is a required field.</p>
							<div class="row">
								<label for="SHSCID">SHSC ID</label>
								<input type="text" name="SHSCID" id="SHSCID" placeholder="SHSC ID">
							</div>
							<!-- end row -->
							<p class="alert o0" id="alert-FirstName" style="display: none;"><strong>First name</strong> is a required field.</p>
							<div class="row">
								<label for="FirstName">First name</label>
								<input type="text" name="FirstName" id="FirstName" placeholder="First name">
							</div>
							<!-- end row -->
							<p class="alert o0" id="alert-LastName" style="display: none;"><strong>Last name</strong> is a required field.</p>
							<div class="row">
								<label for="LastName">Last name</label>
								<input type="text" name="LastName" id="LastName" placeholder="Last name">
							</div>
							<!-- end row -->
							<p class="alert o0" id="alert-Email" style="display: none;">Your <strong>email address</strong> is incorrect. Please re-enter it.</p>
							<div class="row">
								<label for="Email">Email address</label>
								<input type="text" name="Email" id="Email" placeholder="Email address">
							</div>
							<!-- end row -->
							<!-- <div class="row">
								<label for="Password">Password</label>
								<input type="text" name="Password" id="Password" placeholder="Password">
							</div>
							end row -->
							<div class="row submit">
								<input type="button" name="subCreateClinicianAccount" id="subCreate" value="Submit" style="display: none;">
								<button type="button" name="subDeleteClinicianAccount" id="subDelete" value="Delete" style="display: none;">Delete</button>
								<input type="button" name="subEmailClinicianAccount" id="subEmail" value="Submit and Send Email" style="display: none;"> 
							</div>
							<!-- end row -->
						</fieldset>
					</form>
					<!-- end cedForm -->
					<div class="results_container" id="rc"></div>
					<!-- <p id="created" style="display: none;">Clinitian account has been created.</p> -->
				</div>
				<!-- end cedfCont -->
			</article>
			<!-- end cedArt -->
		</div>
		<!-- end minHeight -->
<?php
include('inc/footer.inc.php');
include('inc/scripts.inc.php');
?>
		<!-- <script src="js/clinicianForm.js"></script> -->
		<script>
			$(document).ready(function() {
				$('html').removeClass('no-js').addClass('js');
				ClinicianForm.init();
				NicePlaceholder.init();
				MinHeight.init();
				LabelPad.init();
				CenterDiv.init();
			});
		</script>
	</body>
</html>