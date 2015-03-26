var AccessForm = (function() {
	
	//var formChanged = false;	If any changes were made to the form
	var arrowDir = 'left';		// Assignment direction
	var previousPatientName = 'Select';	// Stores previous dropdown value
	var previousClinicianName = 'Select';	// Stores previous dropdown value
	
	// Enable buttons if any changes made to form
	function enableButtons($boolean) {
		// Check if no clinicians and patients selected from either dropdown list
		var bothUnchanged = $('#ClinicianDropdown').val() == 'Select' && $('#PatientDropdown').val() == 'Select';
		if ($boolean && !bothUnchanged) {
			// $('#subEditAccess').removeAttr('disabled');
			$('#subEditAccess').show();
			// $('#subRevert').removeAttr('disabled');
			$('#subRevert').show();
			formChanged = true;
		} else {
			// $('#subEditAccess').attr("disabled", 'disabled');
			$('#subEditAccess').hide();
			// $('#subRevert').attr("disabled", 'disabled');
			$('#subRevert').hide();
			formChanged = false;
		}
	}
	
	// On change of drop down lists
	// Search for patient/clinician associations connected with name selected
	var clinicianDropdownChanged = function($str) {
		// Check if there are unsaved changes, obtain confirmation from user
		if (formChanged == true) {
			var confirmation = window.confirm('There are unsaved changes, do you wish to change proceed anyway?');
			if (confirmation == false) {
				$('#ClinicianDropdown').val(previousClinicianName);
				return;
			} else 
				formChanged = false;
		}
		previousClinicianName = $str;
		// Reset all checkboxes
		$('[name="PatientChecklist[]"]').attr('checked', false);
		// Quit function if no name is selected
		if ($str == 'Select') {
			enableButtons(false);
			return;
		}
		var results = $.ajax({
			type: 'GET',
			url: 'database/query.php',
			data: {
				"query": $str,
				"retrieve": "patient"
			}
		}).success(function($response) { 
			var data = $.parseJSON($response);
			// Set patient checkboxes to checked or not
			$.each(data, function(key, val) {
				var $el = $('[value="' + val.MedicalRecordNum + '"][name="PatientChecklist[]"]');
				$el.prop('checked', true);
			});
		}).error(function() {
			// console.log('Error');
		}).complete(function() {
			// console.log('complete');
		});
	};	// end ShowPatient
	
	var patientDropdownChanged = function($str) {
		// Check if there are unsaved changes, obtain confirmation from user
		if (formChanged == true) {
			var confirmation = window.confirm('There are unsaved changes, do you wish to change proceed anyway?');
			if (confirmation == false) {
				$('#PatientDropdown').val(previousPatientName);
				return;
			} else 
				formChanged = false;
		}
		previousPatientName = $str;
		// Reset all checkboxes
		$('[name="ClinicianChecklist[]"]').attr('checked', false);
		// Quit function if no name is selected
		if ($str == 'Select') 
			return;
		var results = $.ajax({
	        type: 'GET',
			url: 'database/query.php',
	        data: {
	        	"query": $str,
	        	"retrieve": "clinician"
	        }
	    }).success (function($response) { 
			var data = $.parseJSON($response);		
			// Set clinician checkboxes to checked or not
			$.each(data, function(key, val) {
				var $el = $('[value="' + val.SHSCID + '"][name="ClinicianChecklist[]"]');
				$el.prop('checked', true);
			});
		}).error(function() {
			// console.log('Error');
		}).complete(function() {
			// console.log('complete');
		});
	};	// end patientDropdownChanged
	
	// On click of revert button, reset the form
	var revert = function() {
		enableButtons(false);
		if (arrowDir == 'right') 
			clinicianDropdownChanged($('#ClinicianDropdown').val());
		else 
			patientDropdownChanged($('#PatientDropdown').val());
	};
	
	//Switch arrows and hides/shows checklist/dropdowns
	var arrowSwitch = function() {
		//Check if there are unsaved changes, obtain confirmation from user
		if (formChanged == true) {
			var confirmation = window.confirm('There are unsaved changes, do you wish to change assignment direction?');
			if (confirmation == false) 
				return;
		}
		// Else switch assignment direction
		enableButtons(false);
		if (arrowDir == 'right') {
			arrowDir = 'left';
			//Hide and show appropiate UI elements
			$('#buttonAssignment').css('background-position', '-136px 0px');
			$('#clinicianDropdownDiv').css('display', 'none');
			$('#clinicianChecklistDiv').css('display', 'block');
			$('#patientDropdownDiv').css('display', 'block');
			$('#patientChecklistDiv').css('display', 'none');
			// Reset value of ClinicianDropdown to default
			$('#ClinicianDropdown').val('Select');
			clinicianDropdownChanged($('#ClinicianDropdown').val());
		} else {
			arrowDir = 'right';
			// Hide and show appropiate UI elements
			$('#buttonAssignment').css('background-position', '0px 0px');
			$('#clinicianDropdownDiv').css('display', 'block');
			$('#clinicianChecklistDiv').css('display', 'none');
			$('#patientDropdownDiv').css('display', 'none');
			$('#patientChecklistDiv').css('display', 'block');
			// Reset value of PatientDropdown to default
			$('#PatientDropdown').val('Select');
			patientDropdownChanged($('#PatientDropdown').val());
		}
	};

	//Called after form is submitted
	function processJson(data) { 
		//Error/sucess message passed back from php
		window.alert(data.message); 
		enableButtons(false);
	}
	
	function setup() {
		//Set up initial assignment layout
		arrowSwitch();
		// bind form and provide a simple callback function - http://malsup.com/jquery/form/
	  	$('#accessForm').ajaxForm({ 
			dataType:	'json',			// Expected content type of the server response
			success: processJson,	// Function to invoke when the server response has been received 
			resetForm: true				// Reset the form after successful submit 
		}); 
		//Enable save changes/revert buttons if any changes made to checklists
		$('[name="PatientChecklist[]"]').on('click', function () {
	  		enableButtons(true);
		});
		$('[name="ClinicianChecklist[]"]').on('click', function () {
	  		enableButtons(true);
		});
	}
	
	var init = function() {
		setup();
	};
	
	return {
		clinicianDropdownChanged: clinicianDropdownChanged,
		patientDropdownChanged: patientDropdownChanged,
		revert: revert,
		arrowSwitch: arrowSwitch,
		init: init
	};
	
})();