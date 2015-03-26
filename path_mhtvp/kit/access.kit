<?php
/**
* access.php
* Assign clinician-patient access
*/
session_start();
require_once('database/create_list.php');
 
$title = 'PATH';

include('inc/head.inc.php');
?>
	<body>
<?php
include('inc/header.inc.php');
?>
		<div class="minHeight" id="mh">
			<article class="acpaArt clinician">
				<h2>Assign clinician-patient access</h2>
				<form id="accessForm" method="post" action="database/submit_access.php" class="cedForm">
					<fieldset>
						<input type="hidden" name="UserID" value=<?php echo '"' . $_SESSION['username'] . '"'; ?>>
						<div class="borders clearfloat">
							<div>
								<h3>Clinician</h3>
								<div id="clinicianDropdownDiv">
									<select id="ClinicianDropdown" class="dropdown" name="ClinicianDropdown" onchange="AccessForm.clinicianDropdownChanged(this.value);">
										<option value="Select">--Select--</option>
										<?php createClinicianDropdownOptions(); ?>
									</select>
								</div>
								<!-- end clinicianDropdownDiv -->
								<div id="clinicianChecklistDiv">
									<?php createClinicianChecklist(); ?>
								</div>
								<!-- end clinicianChecklistDiv -->
							</div>
							<div>
								<h3>Assignment</h3>
								<a href="#" title="Switch assignment" class="img btnAssignment" id="buttonAssignment" onclick="AccessForm.arrowSwitch(); return false;"><span>Switch assignment</span></a>
							</div>
							<div>
								<h3>Patient</h3>
								<div id="patientDropdownDiv">
									<select id="PatientDropdown" class="dropdown" name="PatientDropdown" onchange="AccessForm.patientDropdownChanged(this.value);">
										<option value="Select">--Select--</option>
										<?php createPatientDropdownOptionsHideDefault(); ?>
									</select>
								</div>
								<!-- end patientDropdownDiv -->
								<div id="patientChecklistDiv">
									<?php createPatientChecklist(); ?>
								</div>
								<!-- end patientChecklistDiv -->
							</div>
						</div>
						<!-- end borders -->
						<div class="row submit">
							<input type="submit" name="subEditAccess" id="subEditAccess" value="Save Changes" style="display: none;">
							<input type="button" name="subRevert" id="subRevert" value="Revert" onclick="AccessForm.revert();" style="display: none;">
						</div>
						<!-- end row -->
					</fieldset>
				</form>
			</article>
			<!-- end acpaArt -->
		</div>
		<!-- end minHeight -->
<?php
include('inc/footer.inc.php');
include('inc/scripts.inc.php');
?>
		<!-- <script src="js/accessForm.js"></script> -->
		<script>
			$(document).ready(function() {
				$('html').removeClass('no-js').addClass('js');
				AccessForm.init();
				MinHeight.init();
			});
		</script>
	</body>
</html>