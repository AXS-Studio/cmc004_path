<?php
/**
* patient.php
* Add and edit patient accounts
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
			<article class="cedArt patient" id="dw">
				<div class="cedfCont">
					<h2>Create/edit patient account</h2>
					<form id="patientForm" method="post" action="database/submit_patient.php" class="cedForm">
						<fieldset>
							<input type="hidden" name="UserID" value=<?php echo '"' . $_SESSION['userName'] . '"'; ?>>
							<div class="row select">
								<select id="PatientDropdown" class="dropdown" name="PatientDropdown" onchange="PatientForm.patientDropdownChanged(this.value);">
								</select>
							</div>
							<!-- end row -->
							<p class="alert o0" id="alert-MedicalRecordNum" style="display: none;"><strong>MRN</strong> is a required field.</p>
							<div class="row">
								<label for="MedicalRecordNum">MRN</label>
								<input type="text" name="MedicalRecordNum" id="MedicalRecordNum" placeholder="Medical Record Number">
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
							<!-- <p class="alert o0" id="alert-Password" style="display: none;"><strong>Password</strong> is a required field.</p>
							<div class="row">
								<label for="Password">Password</label>
								<input type="password" name="Password" id="Password" placeholder="Password">
							</div>
							end row -->
							<!-- <div class="row">
								<label for="mrn">Confirm password</label>
								<input type="password" name="mrn" id="mrn" placeholder="Confirm password">
							</div>
							end row -->
							<p class="alert o0" id="alert-PhoneNum" style="display: none;">Your <strong>mobile phone number</strong> is incorrect. Please re-enter it.</p>
							<div class="row">
								<label for="mrn">Mobile phone number</label>
								<input type="text" name="PhoneNum" id="PhoneNum" placeholder="Phone #" class="phone">
							</div>
							<!-- end row -->
							<p class="alert o0" id="alert-PhoneCarrier" style="display: none;">Please select a <strong>mobile carrier</strong>.</p>
							<div class="row select">
								<label for="PhoneCarrier">Mobile carrier</label>
								<select name="PhoneCarrier" id="PhoneCarrier">
									<option value="Select">--Select--</option>
									<option value="Bell">Bell</option>
									<option value="Chatr">Chatr</option>
									<option value="Fido">Fido</option>
									<option value="Koodoo">Koodoo</option>
									<option value="Mobilicity">Mobilicity</option>
									<option value="Public">Public</option>
									<option value="Rogers">Rogers</option>
									<option value="Telus">Telus</option>
									<option value="Virgin">Virgin</option>
									<option value="Wind">Wind</option>
                                    <option value="Other">Other</option>
								</select>
							</div>
							<!-- end row -->
							<div class="row">
								<input type="hidden" name="Enabled" value="0">
								<input type="checkbox" name="Enabled" id="Enabled" checked="checked" class="floatLeft">
								<label for="Enabled">Account enabled</label>
							</div>
							<!-- end row -->
							<div class="row submit">
								<input type="button" name="subCreatePatientAccount" id="subCreate" value="Submit" style="display: none;">
								<input type="button" name="subDeletePatientAccount" id="subDelete" value="Delete" style="display: none;">
								<input type="button" name="subEmailPatientAccount" id="subEmail" value="Submit and Send Email" style="display: none;"> 
							</div>
							<!-- end row -->
						</fieldset>
					</form>
					<!-- end cedForm -->
					<div class="results_container" id="rc"></div>
					<!-- <p id="created" style="display: none;">Patient account has been created.</p> -->
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
		<!-- <script src="js/patientForm.js"></script> -->
		<script>
			$(document).ready(function() {
				$('html').removeClass('no-js').addClass('js');
				PatientForm.init();
				MaskFields.init();
				NicePlaceholder.init();
				MinHeight.init();
				LabelPad.init();
				CenterDiv.init();
			});
		</script>
	</body>
</html>