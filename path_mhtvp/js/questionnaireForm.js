var QuestionnaireForm = (function() {
	
	var previousName = 'Default';
	// var formChanged = false;	tracks whether change has been made in form to enable buttons
	
	//Enable buttons if any changes made to form
	function enableButtons($boolean) {
		if ($boolean) {
			// $('#subCustomize').removeAttr('disabled');
			$('#subCustomize').show();
			// $('#subRevert').removeAttr('disabled');
			$('#subRevert').show();
			formChanged = true;
		} else {
			// $('#subCustomize').attr("disabled", 'disabled');
			$('#subCustomize').hide();
			// $('#subRevert').attr("disabled", 'disabled');
			$('#subRevert').hide();
			formChanged = false;
		}
	}
	
	//Toggles time session inputs to the correct number
	var shortFormFrequencyChanged = function($value) {
		console.log($value);
		if ($value == 0) 
			$('#sessionWrapperDiv').css('display', 'none');
		else 
			$('#sessionWrapperDiv').css('display', 'block');	// ALERT: Strange display style
		for (var i = 1; i <= 5; i++) {
			if (i <= $value) 
				$('#Time' + i + 'Div').css('display', 'block');
			else 
				$('#Time' + i + 'Div').css('display', 'none');
		}	// end for loop	
	};	// end shortFormFrequencyChanged
	
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
		enableButtons(false);
		//Quit function if no name is selected
		//if ($str=="Select"){return;}
		var results = $.ajax({
	        type: 'GET',
			url: 'database/query.php',
	        data: {
	        	"query": $str,
	        	"retrieve": "questionnaireSettings"
	        }
	    }).success(function($response) { 
			var data = $.parseJSON($response);
			data = data[0];
			// Set form elements to display updated information
			$.each(data, function(key, val) {
				// console.log(key, val);
				var $el = $('[name="' + key + '"]');
				var $type = $el.attr('type');
				// Have to make an exception for hidden types and checkboxes as they share the same name
				if ($type == 'hidden') {
					$el = $('#' + key);
					$type = $el.attr('type');
				}
				// Get the type of input ie. checkbox, radio etc.
				switch ($type) {
					case 'checkbox' : 
						if (val == '1') 
							$el.prop('checked', true);
						else if (val=='0') 
							$el.prop('checked', false);
						break;
					case 'radio' : 
						$el.filter('[value="' + val + '"]').prop('checked', true);
						break;
					default:
						$el.val(val);
				}
			});	// end for each
			// Set number of time session fields
	  		shortFormFrequencyChanged($('#ShortFormFrequency').val());
		}).error(function() {
			// console.log('Error');
		}).complete(function() {
			// console.log('complete');
		});
	}	// end patientDropdownChanged//On click of revert button, reset the form
	
	var revert = function() {
		enableButtons(false);
		patientDropdownChanged($('#PatientDropdown').val());
	};
	
	function setup() {
		//Setup jQuery UI elements
		$('#StartDate').datepicker({
			"dateFormat": "yy-mm-dd"
		});
		$('#InfreqDate').datepicker({
			"dateFormat": "yy-mm-dd"
		});
		$('#Time1').timepicker();
		$('#Time2').timepicker();
		$('#Time3').timepicker();
		$('#Time4').timepicker();
		$('#Time5').timepicker();
		$('#ShortFormFrequency').spinner({
			"min": 0,
			"max": 5
		});
		$('#LongFormFrequency').spinner({
			"min": 1,
			"max": 100
		});
		$('#ReminderMax').spinner({
			"min": 1,
			"max": 10
		});
		$('#ReminderFrequency').spinner({
			"min": 1,
			"max": 60
		}); 
		//Attach event to spinner
		/*$('#ShortFormFrequency').on('spinchange', function() {
			shortFormFrequencyChanged($('#ShortFormFrequency').spinner('value'));
		});*/
		$('a.ui-spinner-button').click(function() {
			shortFormFrequencyChanged($('#ShortFormFrequency').spinner('value'));
		});
		//Set number of time session fields to default value
		shortFormFrequencyChanged($('#ShortFormFrequency').val());
		// bind 'myForm' and provide a simple callback function
		$('#QuestionnaireSettingsForm').ajaxForm(function() {
			window.alert('User settings created/updated');	// ALERT: I think this function is incomplete.
			enableButtons(false);
		});
		//Enable "Save Changes"/"Revert" buttons if any changes made to checklists
		$('input').on('click', function() {
			enableButtons(true);
		});
		$('.number').on('spin', function() {
			enableButtons(true);
		});
		//Enable save changes/revert buttons if any changes made to checklists
		$('input').on('click', function() {
			// Enable Submit button
			formChanged = true;
			enableButtons(true);
		});
		// Set initial values to "Default user"
		patientDropdownChanged('Default');
	}
	
	var init = function() {
		setup();
	};
	
	return {
		shortFormFrequencyChanged: shortFormFrequencyChanged,
		patientDropdownChanged: patientDropdownChanged,
		revert: revert,
		init: init
	};
	
})();