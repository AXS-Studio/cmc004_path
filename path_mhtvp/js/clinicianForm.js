var ClinicianForm = (function() {
	
	var previousName = 'Select';	//Stores previous dropdown value
	// var formChanged = false;	Flags changes made to form (detects changes on <input> value)
	
	function resetPlaceholders(id, val) {
		$('#' + id).val(val).css('color', '#808080');
	}
	
	//-----Enable/Disable buttons-----
	function enableButtons() {
		var selectedValue = $('#ClinicianDropdown').val();
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
		/*if ($('#Email').val() == '' || $('#Email').val() == "Email address") {
			// $('#subEmail').attr("disabled", 'disabled');
			$('#subEmail').hide();
		} else {
			// $('#subEmail').removeAttr('disabled');
			$('#subEmail').show();
		}*/
	}
	
	//------------------AJAX------------------
	//Create an updated dropdown clinician list from the database using AJAX
	function updateDropdown() {
		var results = $.ajax({
			type: 'GET',
			url: 'database/create_list.php',
			data: {
				"retrieve": "clinicianList"
			}
		}).success(function($response) {
			$('#ClinicianDropdown').html('<option value="Create New">--Create New--</option>' + $response);
			$('#ClinicianDropdown').val(previousName); //set value to previously chosen
			if ($('#ClinicianDropdown').val() == "Create New") {
				// $('#clinicianForm')[0].reset();
				// NicePlaceholder.init();
				FormValidation.clinician();
			}
			enableButtons();		//Change state of buttons if appropiate
		});
	}
	
	//Called when dropdown is changed, update form with database values
	var clinicianDropdownChanged = function($str) {
		//Check if there are unsaved changes, obtain confirmation from user
		if (formChanged == true) {
			var confirmation = window.confirm('There are unsaved changes, do you wish to proceed anyway?');
			if (confirmation == false) {
				$('#ClinicianDropdown').val(previousName);
				return;
			}
		}
		//Remember this value for next time
		previousName = $str;
		formChanged = false;
		
		//"Create New" selected: Clear form
		if ($str == 'Create New') {
			// $('#clinicianForm')[0].reset();
			resetPlaceholders('SHSCID', 'SHSC ID');
			resetPlaceholders('FirstName', 'First name');
			resetPlaceholders('LastName', 'Last name');
			resetPlaceholders('Email', 'Email address');
			enableButtons();
			$('#rc').html('');
			return;
		}
		//Name selected: Enable Delete button (Submit button enabled when user clicks on field)
		enableButtons(false);
		// $('#subDelete').removeAttr('disabled');
		$('#subDelete').show();
		
		//Use AJAX to populate form with data values
		var results = $.ajax({
			type: 'GET',
			url: 'database/query.php',
			data: {
				"query": $str,
				"retrieve": "clinicianAccount"
			}
		}).success(function($response) { 
			var data = $.parseJSON($response);
			data = data[0];
			$.each(data, function(key, val) {
				var $el = $('[name="' + key + '"]');
				$el.val(val);
			});
			$('input[type="text"], input[type="password"]').css('color', '#000');
			enableButtons();
		}).error(function() {}).complete(function() {});
		$('#rc').html('');
		$('#clinicianForm fieldset div.row input[type="text"]').css('background-color', '#fff');
	};	//end clinicianDropdownChanged
	
	//Alert user for deletion
	/*var deleteAlert = function() {
		console.log('Test.');
		var confirmation = window.confirm('Are you sure you want to delete this account?');
		if (confirmation == true) {
			
			
			$.ajax({
				type: 'POST',
				url: 'database/submit_clinician.php',
				data: {
					"subDeleteClinicianAccount": 1
				},
				dataType: 'json',
				success: function(json) {
					$('#rc').html(json.message);
				},
				error: function() {
					window.alert('Error!');
				}
			});
			
			
		}
	};*/
	
	var processJson = function(data) { 
		//Error/sucess message passed back from php
		$('#rc').html(data.message);
		// previousName = $('#ClinicianDropdown').val();
		previousName = 'Create New';
		formChanged = false;
		updateDropdown();	//Update list to reflect changes to database, and enable buttons
		
		
		resetPlaceholders('SHSCID', 'SHSC ID');
		resetPlaceholders('FirstName', 'First name');
		resetPlaceholders('LastName', 'Last name');
		resetPlaceholders('Email', 'Email address');
		enableButtons();
		
		
		
	};
	
	//Opens default email client in a new browser with prefilled content
	function sendEmail(email, firstName) {
		// var accountInformation = 'Hello ' + firstName + ',%0D%0A%0D%0AA PATH account has been created/updated for you. Please visit: http://www.axs3d.com/website/client/DrKreindler/path/ and log in using your SHSC ID and password.%0D%0A%0D%0ASincerely,%0D%0AMHT System Administrator';
		var accountInformation = clinicianEmailCopy(firstName, email);
		var currentRc = $('#rc').html();
		// window.open('mailto:' + email + '?cc=pathadmin@sunnybrook.ca&subject=Your PATH Account&body=' + accountInformation);
		$('#rc').html('<p>' + currentRc + '.<br>\
			<a href="mailto:' + email + '?cc=pathadmin@sunnybrook.ca&subject=Your PATH Account&body=' + accountInformation + '" title="Send ' + firstName + ' an email">Send ' + firstName + ' an email.</a></p>');
	}
	
	function setup() {
		$('#clinicianForm').ajaxForm({ 
			dataType:	'json',			// Expected content type of the server response
			success: processJson	// Function to invoke when the server response has been received 
			// resetForm: true		Reset the form after successful submit 
		});
		
		//Enable save changes/revert buttons if any changes made to checklists
		$('input').focus(function() {
			formChanged = true;
			enableButtons();
		});
		
		updateDropdown();		//Update list for the first time, and enable buttons
	}
	
	var init = function() {
		setup();
	};
	
	return {
		clinicianDropdownChanged: clinicianDropdownChanged,
		// deleteAlert: deleteAlert,
		processJson: processJson,
		sendEmail: sendEmail,
		init: init
	};
	
})();