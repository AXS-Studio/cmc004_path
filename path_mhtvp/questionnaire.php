<?php
/**
* questionnaire.php
* Customize questionnaire and settings for each patient
*/

session_start();
require_once("database/database.php");
require_once("database/create_list.php");
 
$title = 'PATH-MHTV';

include('inc/head.inc.php');
?>
	<body>
<?php
include('inc/header.inc.php');
?>
		<div class="minHeight" id="mh">
			<article class="cqArt clearfloat">
				<div class="floatCont">
					<h2>Customize questionnaire</h2>
					<form id="QuestionnaireSettingsForm" name="QuestionnaireSettingsForm" method="post" action="database/submit_questionnaire.php" class="cedForm" >
						<fieldset>
							<input type="hidden" name="UserID" value=<?php echo '"' . $_SESSION['username'] . '"'; ?>>
							<input type="hidden" name="subCustomize" value="1">
							<div class="borders">
								<div class="patientSelect">
									<h3>Patient</h3>
									<select name="PatientDropdown" id="PatientDropdown" class="dropdown" onChange="QuestionnaireForm.patientDropdownChanged(this.value);">
										<!--<option value='Select'>--Select--</option>-->
										<?php createPatientDropdownOptions(); ?>
									</select>
								</div>
								<!-- end patientSelect -->
								<h3>General Settings</h3>
								<!-- <div class="clearfloat" id="qfRows"> -->
									<div class="row">
										<label for="ShortFormFrequency" class="noRightMarg">Administer</label> <input type="text" name="ShortFormFrequency" id="ShortFormFrequency" maxlength="1" class="number"> <span>scheduled questionnaires per day (max 5)</span>
									</div>
									<!-- end row -->
									<div class="row tod">
										<label for="">Time of day:</label>	<!-- ALERT: These form fields need validation check for blank values -->
										<p class="alert o0" id="alert-Time1" style="display: none;"><strong>Session 1</strong> is a required field.</p>
										<div class="row" id="Time1Div">
											<label for="Time1">Session 1:</label> <input type="text" name="Time1" id="Time1">
										</div>
										<!-- end row -->
										<p class="alert o0" id="alert-Time2" style="display: none;"><strong>Session 2</strong> is a required field.</p>
										<div class="row" id="Time2Div">
											<label for="Time2">Session 2:</label> <input type="text" name="Time2" id="Time2">
										</div>
										<!-- end row -->
										<p class="alert o0" id="alert-Time3" style="display: none;"><strong>Session 3</strong> is a required field.</p>
										<div class="row" id="Time3Div">
											<label for="Time3">Session 3:</label> <input type="text" name="Time3" id="Time3">
										</div>
										<!-- end row -->
										<p class="alert o0" id="alert-Time4" style="display: none;"><strong>Session 4</strong> is a required field.</p>
										<div class="row" id="Time4Div">
											<label for="Time4">Session 4:</label> <input type="text" name="Time4" id="Time4">
										</div>
										<!-- end row -->
										<p class="alert o0" id="alert-Time5" style="display: none;"><strong>Session 5</strong> is a required field.</p>
										<div class="row" id="Time5Div">
											<label for="Time5">Session 5:</label> <input type="text" name="Time5" id="Time5">
										</div>
										<!-- end row -->
									</div>
									<!-- end row -->
									<div class="row">
										<label for="LongFormFrequency" class="noRightMarg">Administer infrequent items every</label> <input type="text" name="LongFormFrequency" id="LongFormFrequency" maxlength="2" value="7" class="number"> <span>days</span>
									</div>
									<!-- end row -->
									<div class="row">
										<label for="StartDate">Infrequent items administered next on:</label> <input type="text" name="StartDate" id="StartDate" value="3" placeholder="mm/dd/yyyy" class="date">
									</div>
									<!-- end row -->
								</div>
								<!-- end borders -->
								<div class="borders">
									<div class="row">
										<label for="Reminder">Reminders:</label> <input type="radio" name="Reminder" id="ReminderYes" value="1" checked="checked"> <label for="ReminderYes">yes</label> <input type="radio" name="Reminder" id="ReminderNo" value="0"> <label for="ReminderNo">no</label>
									</div>
									<!-- end row -->
									<div class="row">
										<label for="ReminderMax">Max # of Reminders:</label> <input type="text" name="ReminderMax" id="ReminderMax" maxlength="1" value="7" class="number">
									</div>
									<!-- end row -->
									<div class="row">
										<label for="ReminderFrequency" class="noRightMarg">Reminder every</label> <input type="text" name="ReminderFrequency" id="ReminderFrequency" maxlength="2" value="5" class="number"> <span>minutes</span>
									</div>
									<!-- end row -->
								</div>
								<!-- end borders -->
								<div class="borders">
									<div class="row">
										<label for="RandomizeQuestions">Randomize questions:</label> <input type="radio" name="RandomizeQuestions" id="RandomizeQuestionsYes" value="1"> <label for="RandomizeQuestionsYes">yes</label> <input type="radio" name="RandomizeQuestions" id="RandomizeQuestionsNo" value="0" checked="checked"> <label for="RandomizeQuestionsNo">no</label>
									</div>
									<!-- end row -->
									<div class="row">
										<label for="RandomizeVASAnchors">Randomize VAS anchors:</label> <input type="radio" name="RandomizeVASAnchors" id="RandomizeVASAnchorsYes" value="1"> <label for="RandomizeVASAnchorsYes">yes</label> <input type="radio" name="RandomizeVASAnchors" id="RandomizeVASAnchorsNo" value="0" checked="checked"> <label for="RandomizeVASAnchorsNo">no</label>
									</div>
									<!-- end row -->
								</div>
								<!-- end borders -->
								<div class="borders">
									<div class="row">
										<h3>Questions</h3>
										<table>
											<thead>
												<tr>
													<th>Include</th>
													<th>Infrequent</th>
													<th>QuestionID</th>
													<th>Description</th>
												</tr>
											</thead>
											<tbody>
	<?php
	global $conn;
	$q = "SELECT `QuestionID`,`Description` FROM `Questions` ORDER BY `Order`";
	$result = mysql_query($q, $conn);
	while ($row = mysql_fetch_array ($result)) {
		
		$questionID = $row['QuestionID'];	
		$description = $row['Description'];	
		
		echo
		'<tr><td>
		<input name="' . $questionID . '" type="hidden" value="0">
		<input type="checkbox" name="' . $questionID . '" id="' . $questionID . '" value="1" checked="checked">
		</td>
		<td><input name="' . $questionID . '_Infreq" type="hidden" value="0">
	    <input type="checkbox" name="' . $questionID . '_Infreq" id="' . $questionID . '_Infreq" value="1" checked="checked"></td>
	  	<td>' . $questionID . '</td>
		<td>' . $description . '</td></tr>';
	}//end while
	?>
												<!-- <tr>
													<td><input type="checkbox" name="" id=""></td>
													<td><input type="checkbox" name="" id=""></td>
													<td>mc_0</td>
													<td>DID_Depressed mood</td>
												</tr> -->
											</tbody>
										</table>
									</div>
								</div>
								<!-- end borders -->
								<div class="row submit">
									<input type="button" name="btnSubCustomize" id="btnSubCustomize" value="Save Changes">
									<input type="button" name="subRevert" id="subRevert" value="Revert" onClick="QuestionnaireForm.revert();" style="display: none;">
								</div>
								<!-- end row -->
							<!-- </div>
							end qfRows -->
						</fieldset>
					</form>
				</div>
				<!-- end  -->
			</article>
			<!-- end cqArt -->
		</div>
		<!-- end minHeight -->
<?php
include('inc/footer.inc.php');
include('inc/scripts.inc.php');
?>
		<!-- <script src="js/questionnaireForm.js"></script> -->
		<script>
			$(document).ready(function() {
				$('html').removeClass('no-js').addClass('js');
				QuestionnaireForm.init();
				FormValidation.questionnaire();
				MinHeight.init();
			});
		</script>
	</body>
</html>