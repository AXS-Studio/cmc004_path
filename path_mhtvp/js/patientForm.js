var PatientForm = (function() {
	
	var previousName = 'Select';	//Stores previous dropdown value
	// var formChanged = false;	Flags changes made to form (detects changes on <input> value)
	
	function resetPlaceholders(id, val) {
		$('#' + id).val(val).css('color', '#808080');
	}
	
	//-----Enable/Disable buttons-----
	function enableButtons() {
		var selectedValue = $('#PatientDropdown').val();
		if (selectedValue == 'Create New') {
			if (formChanged == true) {
				// $('#subCreate').removeAttr('disabled');
				$('#subCreate, #subEmail').show();
			} else if (formChanged == false) {
				// $('#subCreate').attr("disabled", 'disabled');
				$('#subCreate, #subEmail').hide();
			}
			// $('#subDelete').attr("disabled", 'disabled');
			$('#subDelete').hide();
		} else {
			if (formChanged == true) {
				// $('#subCreate').removeAttr('disabled');
				$('#subCreate, #subEmail').show();
			} else if (formChanged == false) {
				// $('#subCreate').attr("disabled", 'disabled');
				$('#subCreate, #subEmail').hide();
			}
			// $('#subDelete').removeAttr('disabled');
			$('#subDelete').show();
		}
		/*if ($('#Email').val() == '' || $('#Email').val() == 'Email address' || $('#Password').val() == '') {
			// $('#subEmail').attr("disabled", 'disabled');
			$('#subEmail').hide();
		} else {
			// $('#subEmail').removeAttr('disabled');
			$('#subEmail').show();
		}*/
	}
	
	//------------------AJAX------------------
	//Create an updated dropdown list from the database using AJAX
	function updateDropdown() {
		var results = $.ajax({
			type: 'GET',
			url: 'database/create_list.php',
			data: {
				"retrieve": "patientList"
			}
		}).success(function($response) {
			$('#PatientDropdown').html('<option value="Create New">--Create New--</option>' + $response);
			$('#PatientDropdown').val(previousName); //set value to previously chosen
			if ($('#PatientDropdown').val() == 'Create New') {
				// $('#patientForm')[0].reset();
				// $('#Password').attr("placeholder", "Password");
				// NicePlaceholder.init();
				FormValidation.patient();
			}
			enableButtons(); //Change state of buttons if appropiate	
		});
	} //end updateDropdown
	
	//Called when dropdown is changed, update form with database values
	var patientDropdownChanged = function($str) {
		//Check if there are unsaved changes, obtain confirmation from user
		if (formChanged == true) {
			var confirmation = window.confirm('There are unsaved changes, do you wish to proceed anyway?');
			if (confirmation == false) {
				$('#PatientDropdown').val(previousName);
				return;
			}
		}
		//Remember this value for next time
		previousName = $str;
		formChanged = false;
		
		//"Create New" selected: Clear form and exit function
		if ($str == 'Create New') {
			// $('#patientForm')[0].reset();
			// $('#Password').attr("placeholder", "Password");
			//$('#confirmPassword').attr("placeholder", "Confirm Password");
			resetPlaceholders('MedicalRecordNum', 'Medical Record Number');
			resetPlaceholders('FirstName', 'First name');
			resetPlaceholders('LastName', 'Last name');
			resetPlaceholders('Email', 'Email address');
			resetPlaceholders('Password', 'Password');
			resetPlaceholders('PhoneNum', 'Phone #');
			$('#PhoneCarrier').val('Select');
			$('#Enabled').prop('checked', true);
			enableButtons();
			$('#rc').html('');
			return;
		}
		//Use AJAX to populate form with data values
		var results = $.ajax({
			type: 'GET',
			url: 'database/query.php',
			data: {
				"query": $str,
				"retrieve": "patientAccount"
			}
		}).success(function($response) {
			var data = $.parseJSON($response); //Parse JSON into object
			data = data[0];
			//Set form elements to display updated information
			$.each(data, function(key, val) {
				var $el = $('#' + key); //Get element by id
				var $type = $el.attr('type'); //Get the type of input ie. checkbox, radio etc.
				switch ($type) {
					case 'checkbox' : 
						if (val == '1') 
							$el.prop('checked', true);
						else if (val == '0') 
							$el.prop('checked', false);
						break;
					default : 
						$el.val(val);
				}
			}); //end for each
			//Set confirmPassword field to same value, and hide hashed passwords
			// $('#Password').val('');
			// $('#Password').attr('placeholder', 'Password hashed, click to change');
			//$('#confirmPassword').val("");
			//$('#confirmPassword').attr("placeholder", "Password hashed, click to change");
			$('input[type="text"], input[type="password"]').css('color', '#000');
			enableButtons();
		}).error(function() {}).complete(function() {});
		
		$('#rc').html('');
		$('#patientForm fieldset div.row input[type="text"], #patientForm fieldset div.row input[type="password"]').css('background-color', '#fff');
	}; //end patientDropdownChanged
	
	//Alert user for deletion
	/*var deleteAlert = function() {
		return window.confirm('Are you sure you want to delete this account?');
	};*/
	
	var processJson = function(data) {
		//Error/sucess message passed back from php
		$('#rc').html(data.message);
		// previousName = $('#PatientDropdown').val();
		previousName = 'Create New';
		formChanged = false;
		updateDropdown(); //Update list to reflect changes to database, and enable buttons
		
		
		resetPlaceholders('MedicalRecordNum', 'Medical Record Number');
		resetPlaceholders('FirstName', 'First name');
		resetPlaceholders('LastName', 'Last name');
		resetPlaceholders('Email', 'Email address');
		resetPlaceholders('PhoneNum', 'Phone #');
		$('#PhoneCarrier').val('Select');
		$('#Enabled').prop('checked', true);
		enableButtons();
		
		
		
	};

	//Opens default email client in a new browser with prefilled content
	function sendEmail(email, password, firstName) {	// ALERT: Stopped here.
		// var accountInformation = 'Hello ' + firstName + ',%0D%0A%0D%0APlease create your password at http://www.axs3d.com/website/client/DrKreindler/mht/?n=' + password + '%0D%0A%0D%0AYour login email is: ' + email + '%0D%0A%0D%0Afrom Sunnybrook MHT admin';
		var accountInformation = patientEmailCopy(firstName, password, email);
		var currentRc = $('#rc').html();
		// window.open('mailto:' + email + '?cc=pathadmin@sunnybrook.ca&subject=Your Mental Health Telemetry Account&body=' + accountInformation);
		$('#rc').html(currentRc + '.<br>\
			<a href="mailto:' + email + '?cc=pathadmin@sunnybrook.ca&subject=Your Mental Health Telemetry Account&body=' + accountInformation + '" title="Send ' + firstName + ' an email">Send ' + firstName + ' an email.</a>');
	}
	
	function setup() {
		// bind form and provide a simple callback function 
		$('#patientForm').ajaxForm({
			dataType: 'json',
			// Expected content type of the server response 
			success: processJson,
			// Function to invoke when the server response has been received 
			resetForm: true		// Reset the form after successful submit 
		});
		//Change state of buttons if any changes made to checklists
		$('input').on('click', function() {
			formChanged = true;
			enableButtons();
		});
		$('#PhoneCarrier').on('change', function() {
			formChanged = true;
			enableButtons();
		});
		updateDropdown(); //Update list for the first time, and enable buttons
	}
	
	var init = function() {
		setup();
	};
	
	return {
		patientDropdownChanged: patientDropdownChanged,
		// deleteAlert: deleteAlert,
		processJson: processJson,
		sendEmail: sendEmail,
		init: init
	};

})();