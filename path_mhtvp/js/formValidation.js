var FormValidation = (function() {
	
	var submitted = false;
	var valid = true;
	var validEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
	var validPhone = /^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})$/;
	var validTenDigits = /^\d{10}$/;
	
	var showAlerts = function(id) {
		$('#alert-' + id).show().attr('class', 'alert o1');
		// $('#' + id).removeClass('tiWhite').addClass('tiAlert');
		if (id != 'PhoneCarrier') {
			if (id == 'dontMatch') {
				$('#user, #pass').animate({
					backgroundColor: '#ffecec'
				}, 500);
			} else if (id == 'clinician') {
				$('#user').animate({
					backgroundColor: '#ffecec'
				}, 500);
			} else {
				$('#' + id).animate({
					backgroundColor: '#ffecec'
				}, 500);
			}
		}
		setTimeout(function() {
			$('#alert-' + id).attr('class', 'alert o0');
		}, 3000);
		setTimeout(function() {
			$('#alert-' + id).hide();
		}, 3500);
	};
	
	function textTest(text, placeholder, id) {
		if (text == 0 || text == placeholder) {
			showAlerts(id);
			valid = false;
		}
	}
	
	function emailTest(email, id) {
		if (!validEmail.test(email)) {
			showAlerts(id);
			valid = false;
		}
	}
	
	function passwordTest(text, placeholder, id) {
		if ($('#' + id).attr('placeholder') != 'Password hashed, click to change') {
			if (text == 0 || text == placeholder) {
				showAlerts(id);
				valid = false;
			}
		}
	}
	
	function phoneTest(number, id) {
		if (!validPhone.test(number) && !validTenDigits.test(number)) {
			showAlerts(id);
			valid = false;
		}
	}
	
	function selTest(val, placeholder, id) {
		if (val == placeholder) {
			showAlerts(id);
			valid = false;
		}
	}
	
	/*function addEditSubmit(form) {
		if (valid == false) 
			return false;
		else {
			$('#' + form).submit();
			// console.log(form);
		}
	}*/
	
	function formSubmit(data, form) {
		console.log(data);
		if (data.subDeleteClinicianAccount || data.subDeletePatientAccount) {
			var confirmation = window.confirm('Are you sure you want to delete this account?');
			if (confirmation == false) 
				valid = false;
		}
		if (valid == false) {
			submitted = false;
			return false;
		} else {
			if (data.PhoneNum) {
				// console.log(!validTenDigits.test(data.PhoneNum));
				if (!validTenDigits.test(data.PhoneNum)) {
					var area = data.PhoneNum.split('(')[1];
					area = area.split(')')[0];
					var pref = data.PhoneNum.split(' ')[1];
					pref = pref.split('-')[0];
					var suff = data.PhoneNum.split('-')[1];
					data.PhoneNum = '' + area + pref + suff;
				}
			}
			$.ajax({
				type: 'POST',
				url: $('#' + form).attr('action'),
				data: data,
				dataType: 'json',
				success: function(json) {
					if (form == 'login') {
						if (json.result === 0) {
							// Invalid database query credentials, please contact Admin
							showAlerts('dontMatch');
						} else if (json.result === 1) {
							// Successful
							window.location = 'index.php';
						} else if (json.result === 2) {
							// Clinician not found in PATH database
							showAlerts('clinician');
						} else if (json.result === 3) {
							// Invalid Sunnybrook SHSC password
							showAlerts('pass');
						} else if (json.result === 4) {
							// Invalid Sunnybrook SHSC ID
							showAlerts('user');
						}
					} else if (form == 'clinicianForm' || form == 'patientForm') {
						// console.log(json);
						if (form == 'clinicianForm') {
							if (json.message.split(':')[0] == 'Error') {
								if (json.message.split(': SHSC ID')[0] == 'Error') {	// Error: SHSC ID sdfsdf is already in the database
									$('#SHSCID').animate({
										backgroundColor: '#ffecec'
									}, 500);
								}
								$('#rc').html(json.message);
							} else {
								ClinicianForm.processJson(json);
								// ClinicianForm.clinicianDropdownChanged('Create New');
								if (data.subEmailClinicianAccount) {
									// console.log(data.Email + ', ' + data.FirstName);
									ClinicianForm.sendEmail(data.Email, data.FirstName);
								}
							}
							submitted = false;
						} else {
							if (json.message.split(':')[0] == 'Error') {
								if (json.message.split(': MRN')[0] == 'Error') {	// Error: MRN Record08 is already in the database
									$('#MedicalRecordNum').animate({
										backgroundColor: '#ffecec'
									}, 500);
								}
								$('#rc').html(json.message);
							} else {
								PatientForm.processJson(json);
								if (data.subEmailPatientAccount) {
									// console.log(data.Email + ', ' + json.n + ', ' + data.FirstName);
									PatientForm.sendEmail(data.Email, json.n, data.FirstName);
								}
							}
							submitted = false;
						}
						/*if (data.subEmailClinicianAccount == 'Submit and Send Email' && json.message.split(' <strong>')[0] == 'Successfully added') 
							sendEmail();*/
					}
				},
				error: function() {
					window.alert('Error!');
				}
			});
		}
	}

	var questionnaire = function() {
		$('#btnSubCustomize').click(function() {
			$('#QuestionnaireSettingsForm fieldset div.row input[type="text"]').css('background-color', '#fff');
			valid = true;
			$('div.tod div.row input').each(function() {
				if ($(this).parent().css('display') != 'none') {
					var id = $(this).attr('id');
					textTest($('#' + id).val(), '', id);
				}
			});
			if (valid == true) 
				$('#QuestionnaireSettingsForm').submit();
			return false;
		});
	};

	var patient = function() {
		$('#subCreate, #subDelete, #subEmail').click(function() {
			if (submitted == false) {
				// console.log('click');
				submitted = true;
				var selectVal = $('#PatientDropdown').val();
				var name = $(this).attr('name');
				var value = $(this).attr('value');
				$('#patientForm fieldset div.row input[type="text"], #patientForm fieldset div.row input[type="password"]').css('background-color', '#fff');
				valid = true;
				textTest($('#MedicalRecordNum').val(), 'Medical Record Number', 'MedicalRecordNum');
				textTest($('#FirstName').val(), 'First name', 'FirstName');
				textTest($('#LastName').val(), 'Last name', 'LastName');
				emailTest($('#Email').val(), 'Email');
				// passwordTest($('#Password').val(), 'Password', 'Password');
				phoneTest($('#PhoneNum').val(), 'PhoneNum');
				selTest($('#PhoneCarrier').val(), 'Select', 'PhoneCarrier');
				var enabled = ($('#Enabled').is(':checked')) ? 1 : 0;
				// console.log(enabled);
				if (name == 'subCreatePatientAccount') {
					var data = {
						"UserID": $('#UserID').val(),
						"PatientDropdown": selectVal,
						"MedicalRecordNum": $('#MedicalRecordNum').val(),
						"FirstName": $('#FirstName').val(),
						"LastName": $('#LastName').val(),
						"Email": $('#Email').val(),
						// "Password": $('#Password').val(),
						"PhoneNum": $('#PhoneNum').val(),
						"PhoneCarrier": $('#PhoneCarrier').val(),
						"Enabled": enabled,
						"subCreatePatientAccount": 1
					};
				} else if (name == 'subDeletePatientAccount') {
					var data = {
						"UserID": $('#UserID').val(),
						"PatientDropdown": selectVal,
						"MedicalRecordNum": $('#MedicalRecordNum').val(),
						"FirstName": $('#FirstName').val(),
						"LastName": $('#LastName').val(),
						"Email": $('#Email').val(),
						// "Password": $('#Password').val(),
						"PhoneNum": $('#PhoneNum').val(),
						"PhoneCarrier": $('#PhoneCarrier').val(),
						"Enabled": enabled,
						"subDeletePatientAccount": 1
					};
				} else {
					var data = {
						"UserID": $('#UserID').val(),
						"PatientDropdown": selectVal,
						"MedicalRecordNum": $('#MedicalRecordNum').val(),
						"FirstName": $('#FirstName').val(),
						"LastName": $('#LastName').val(),
						"Email": $('#Email').val(),
						// "Password": $('#Password').val(),
						"PhoneNum": $('#PhoneNum').val(),
						"PhoneCarrier": $('#PhoneCarrier').val(),
						"Enabled": enabled,
						"subEmailPatientAccount": 1
					};
				}
				// console.log(data.Enabled);
				formSubmit(data, 'patientForm');
				// addEditSubmit('clinicianForm');
			}
			return false;
		});
	};

	var clinician = function() {
		$('#subCreate, #subDelete, #subEmail').click(function() {
			console.log('Huh?');
			if (submitted == false) {
				submitted = true;
				var selectVal = $('#ClinicianDropdown').val();
				var name = $(this).attr('name');
				var value = $(this).attr('value');
				$('#clinicianForm fieldset div.row input[type="text"]').css('background-color', '#fff');
				valid = true;
				textTest($('#SHSCID').val(), 'SHSC ID', 'SHSCID');
				textTest($('#FirstName').val(), 'First name', 'FirstName');
				textTest($('#LastName').val(), 'Last name', 'LastName');
				emailTest($('#Email').val(), 'Email');
				if (name == 'subCreateClinicianAccount') {
					var data = {
						"ClinicianDropdown": selectVal,
						"SHSCID": $('#SHSCID').val(),
						"FirstName": $('#FirstName').val(),
						"LastName": $('#LastName').val(),
						"Email": $('#Email').val(),
						"subCreateClinicianAccount": 1
					};
				} else if (name == 'subDeleteClinicianAccount') {
					var data = {
						"ClinicianDropdown": selectVal,
						"SHSCID": $('#SHSCID').val(),
						"FirstName": $('#FirstName').val(),
						"LastName": $('#LastName').val(),
						"Email": $('#Email').val(),
						"subDeleteClinicianAccount": 1
					};
				} else {
					var data = {
						"ClinicianDropdown": selectVal,
						"SHSCID": $('#SHSCID').val(),
						"FirstName": $('#FirstName').val(),
						"LastName": $('#LastName').val(),
						"Email": $('#Email').val(),
						"subEmailClinicianAccount": 1
					};
				}
				formSubmit(data, 'clinicianForm');
				// addEditSubmit('clinicianForm');
			}
			return false;
		});
	};

	var login = function() {
		$('#sublogin').click(function() {
			$('#user, #pass').css('background-color', '#fff');
			valid = true;
			textTest($('#user').val(), 'SHSC ID', 'user');
			textTest($('#pass').val(), 'Password', 'pass');
			var data = {
				"user": $('#user').val(),
				"pass": $('#pass').val()
			};
			formSubmit(data, 'login');
			return false;
		});
	};
	
	var init = function() {
		
	};
	
	return {
		questionnaire: questionnaire,
		patient: patient,
		clinician: clinician,
		login: login,
		init: init
	};
	
})();
