<?php
/**
* main.php
* main landing page for PATH
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
			<article class="grapher">
				<form id="dataVisForm" action="#" class="clearfloat">
					<fieldset>
						<label for="PatientDropdown">Patient</label>
						<select name="PatientDropdown" id="PatientDropdown" class="dropdown" onChange="DataVisualizationSelect.selectChanged(this.value);">
						</select>
					</fieldset>
					<fieldset id="saveEditSelect">
						&nbsp;
					</fieldset>
				</form>
				<!-- end dataVisForm -->
				<div class="containerForGraphs" id="cfg"><div id="cfgGraphs">&nbsp;</div></div>
			</article>
			<!-- end grapher -->
			<article class="mainBox" id="mb">
				<p>Welcome. To begin, choose a patient from the list above<br>
            		or select another activity from the top menu.</p>
			</article>
			<!-- end mainBox -->
		</div>
		<!-- end minHeight -->
		
<?php
include('inc/footer.inc.php');
include('inc/scripts.inc.php');
?>
		<script>
			var patient,
				clinician = '<?php print $_SESSION['userName']; ?>',
				questions,
				initialData;
			
			$(document).ready(function() {
				$('html').removeClass('no-js').addClass('js');
				MinHeight.init();
				DataVisualizationSelect.init();
			});
        
    </script>

	</body>
</html>