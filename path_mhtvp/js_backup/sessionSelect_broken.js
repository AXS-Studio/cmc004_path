var SessionSelect = (function() {
	
	var sessions = {
		nextID: 0,
		data: [
			/*{
				"value": 0,
				"name": "Untitled Session 1"
			},
			{
				"value": 1,
				"name": "Untitled Session 2"
			},
			{
				"value": 2,
				"name": "Untitled Session 3"
			},
			{
				"value": 3,
				"name": "Untitled Session 4"
			},
			{
				"value": 4,
				"name": "Untitled Session 5"
			}*/
		]
	};
	
	var initialSession = null;
	var validName = /^([a-zA-Z0-9\s_-]+)$/;
	var defaultOpt = '<option value="default" selected="selected">Create New</option>';
	// incremetnal value to uniquely identify options. This will probably be provided by the server
	var option_id = 6;
	// This is the value passed from the server on page load. for now this is denoted by the 'selected' attribute in the HTML
	var current_val = $('#session-mngr').val();
	var prev_val = null;
	var current_value = 'default';
	// This is the text shown for the current value
	var current_html = $('#session-mngr option[value="' + current_val + '"]').html();
	var prev_html = null;
	var current_htmltext = 'Create New';
	var formSubmitted = false;
	var nameTaken = false;
	var renameName = null;
	var deleteName = null;
	
	// Shows the modal
	function show_modal(target, title, current_name) {
		// show grey overlay
		$('#overlay').fadeIn(500);
		// adds hook so we know waht this form is doing (rename/saveas)
		$('#session-edit').addClass(target);
		// adds the title
		$('#session-modal').find('h2').html(title);
		if (target === 'saveas') 
			$('#session-edit #name').val(current_name);
		// if we're renaming, it pre-populates the modals text field with the current value
		else if (target === 'rename') 
			$('#session-edit #name').val($('#session-mngr option[value="' + current_name + '"]').html());
		$('.modal-wrapper').fadeIn(500);
	}
	
	function reset_modal() {
		$('#overlay').fadeOut(500);
		$('.modal-wrapper').fadeOut(500);
		$('#session-edit #name').val('');
		$('#session-edit').removeClass('saveas', 'rename');
	}
	
	function set_selected(target) {
		$('#session-mngr').val(target);
	}
	
	function loadNewSession(val, html) {
	
		current_value = val;
		current_htmltext = html;
		
		if (html == 'Create New') {
			var getData = {
				"patientID": patient
			};
		} else {
			var getData = {
				"patientID": patient,
				"sessionName": current_htmltext
			};
		}
		
		$.ajax({
			url: 'database/query_answers_initial.php',
			type: 'POST',
			data: getData,
			dataType: 'json',
			success: function(response) {
				
				$('#cfgGraphs').html('<div class="svgWrap" id="svgParent" style="display: none;">\
					<a href="#" title="Moving Average" class="img topBtn btnMa" id="btnMa-parent"><span>Moving Average</span></a>\
					<a href="#" title="Integrals" class="img topBtn btnIntegrals" id="btnIntegrals-parent"><span>Integrals</span></a>\
				</div>\
				<!-- end svgWrap -->\
				<div class="svgWrap" id="svgRange1" style="display: none;">\
					<h2>Range 1</h2>\
					<a href="#" title="Moving Average" class="img topBtn btnMa" id="btnMa-range1"><span>Moving Average</span></a>\
					<a href="#" title="Integrals" class="img topBtn btnIntegrals" id="btnIntegrals-range1"><span>Integrals</span></a>\
				</div>\
				<!-- end svgWrap -->\
				<div class="svgWrap" id="svgRange2" style="display: none;">\
					<h2>Range 2</h2>\
					<a href="#" title="Moving Average" class="img topBtn btnMa" id="btnMa-range2"><span>Moving Average</span></a>\
					<a href="#" title="Integrals" class="img topBtn btnIntegrals" id="btnIntegrals-range2"><span>Integrals</span></a>\
				</div>');
				
				initialData = response;
				// console.log(initialData);
				D3graph.init();
			},
			error: function() {
				window.alert('Error retrieving session.');
			}
		});
		
		
		
		
		
	}
	
	var ssGo = function() {
		var result = $('#session-mngr').val();
		// User hits SAVE
		switch (result) {
			case 'save' : 
				set_selected(current_value);
				window.alert('Your current session “' + $('#session-mngr option[value="' + current_value + '"]').html() + '” has been saved.');
	
				// AJAX SAVE FUNCTION GOES HERE
				
				
				
				
				
				$.ajax({
					url: 'database/submit_session.php',
					type: 'POST',
					data: {
						"clinicianID": clinician,
						"patientID": patient,
						"session": $('#session-mngr option[value="' + $('#session-mngr').val() + '"]').html(),
						"action": "save",
						"data": {
							"range1dates": D3graph.getRange1dates(),
							"range2dates": D3graph.getRange2dates(),
							"settings": D3graph.getSettings()
						}
					},
					dataType: 'json',
					success: function(response) {
						// if (response.result == 1) 
							// notesSubmitted = false;
						console.log(response);
						D3graph.setSessChanged();
					},
					error: function() {
						window.alert('Error saving session.');
					}
				});
				
			
				
				
	
				break;
			case 'saveas' : 
				formSubmitted = false;
				if (sessions.data.length < 1) 
					set_selected('default');
				else 
					set_selected(current_val);
				show_modal(result, 'Save as…', 'untitled_session_' + (sessions.nextID + 1));
				
				
				
				break;
			case 'rename' : 
				formSubmitted = false;
				renameName = current_html;
				set_selected(current_val);
				show_modal(result, 'Rename Session', current_val);
				
				
				
				break;
			case 'delete' : 
				$('#session-mngr').val(current_val);
				var delConf = window.confirm('Are you sure you want to delete this session?');
				if (delConf == true) {
					var deleteVal = current_val.split('-')[1];
					for (var i = 0; i < sessions.data.length; i++) {
						if (sessions.data[i].value == deleteVal) {
							sessions.data.splice(i, 1);
						}
					}
					if (sessions.data.length < 1) {
						// $('#session-mngr').append(defaultOpt);
						$('#session-mngr option[value="save"], #session-mngr option[value="rename"], #session-mngr option[value="delete"]').prop('disabled', true);
					}
					deleteName = current_html;
					window.alert('The session titled “' + deleteName + '” has been deleted.');
					// So the "DELETE" doesn't show
					set_selected(current_val);
					// Removes the one selected to be dleeted.
					$('#session-mngr option[value="' + current_val + '"]').remove();
					// changes current val to the new one selected now as a reuslt of deletion.
					current_val = $('#session-mngr option[value="-"]').next('option').val();
					current_html = $('#session-mngr option[value="' + current_val + '"]').html();
					// Changes selected value to the next available option.
					$('#session-mngr').val(current_val);
	
					// AJAX DELETE FUNCTION GOES HERE
					
					
					/*
					
					
					$.ajax({
						url: 'database/submit_session.php',
						type: 'POST',
						data: {
							"clinicianID": clinician,
							"patientID": patient,
							"session": deleteName,
							"action": "delete"
						},
						dataType: 'json',
						success: function(response) {
							// if (response.result == 1) 
								// notesSubmitted = false;
							console.log(response);
						},
						error: function() {
							window.alert('Error deleting session.');
						}
					});
					
					
					*/
					
					
				} else {
					set_selected(current_val);
				}
				break;
			// prevents the '-------' option from being selected.
			case '-' : 
				set_selected(current_val);
				break;
			// default behavior of the select box.
			default : 
			
			
			
			
				var sessionChanged = D3graph.getSessChanged();
				// console.log(sessionChanged);
				if (sessionChanged == true) {
					var changeConf = window.confirm('You have unsaved changes. Are you sure you want to switch to a different session?');
					if (changeConf == true) {
						loadNewSession($('#session-mngr').val(), $('#session-mngr option[value="' + $('#session-mngr').val() + '"]').html());
					} else {
						set_selected(current_val);
					}
				} else {
					// set_selected(current_val);
					// console.log($('#session-mngr option[value="' + $('#session-mngr').val() + '"]').html());
					loadNewSession($('#session-mngr').val(), $('#session-mngr option[value="' + $('#session-mngr').val() + '"]').html());
				}
				break;
				
				
				
				
		}
		
		
		// MODAL FORM BEHAVIORS AND VALIDATION
		$('#session-edit-cancel').on('click', function() {
			reset_modal();
			return false;
		});
		$('#session-edit-submit').on('click', function() {
			if (formSubmitted == false) {
				formSubmitted = true;
				nameTaken = false;
				var nameVal = $('#session-edit #name').val();
				// Remove all of the spaces at the beginning of the name if there are any
				while (nameVal.charAt(0) === ' ') 
					nameVal = nameVal.substr(1);
				// Remove all of the spaces at the end of the name if there are any
				while (nameVal.charAt(nameVal.length - 1) === ' ') 
					nameVal = nameVal.substr(0, nameVal.length - 1);
				if (nameVal === '') {
					window.alert('Please enter a session name.');
					setTimeout(function() {
						formSubmitted = false;
					}, 250);
				} else if (!validName.test(nameVal)) {
					window.alert('Please enter a properly formatted session name.');
					setTimeout(function() {
						formSubmitted = false;
					}, 250);
				} else {
					for (var i = 0; i < sessions.data.length; i++) {
						if (sessions.data[i].name == nameVal) 
							nameTaken = true;
					}
					if (nameTaken == true) {
						window.alert('That name is already being used by another of your saved sessions. Please provide a unique session name.');
						setTimeout(function() {
							formSubmitted = false;
							nameTaken = false;
						}, 250);
					} else {
						// For SAVEAS form...
						if ($('#session-edit').hasClass('saveas')) {
							// If there are no currently saved sessions...
							/*if (sessions.data.length < 1) {
								// ...if one of the current options has the value 'default...'
								$('#session-mngr option').each(function() {
									if ($(this).attr('value') == 'default') 
										// ...remove it
										$(this).remove();
								});
							}*/
							// Get the name from the form
							option_name = nameVal;
							// Add a new session object to the sessions array
							sessions.data.push({
								"value": sessions.nextID,
								"name": option_name
							});
							// add the option to the selector
							$('#session-mngr').append('<option value="session-' + sessions.nextID + '">' + option_name + '</option>');
							// Make sure any options that are marked as selected or disabled are cleared as such
							$('#session-mngr option').prop('selected', false).prop('disabled', false);
							// set our new session as the selected one
							$('#session-mngr').val('session-' + sessions.nextID);
							// up the incremental id by 1
							sessions.nextID++;
							reset_modal();
							// changes current val to the new one
							current_val = $('#session-mngr').val();
							current_html = $('#session-mngr option[value="' + current_val + '"]').html();
							setTimeout(function() {
								window.alert('Your new session ”' + current_html + '” has been saved.');
							}, 500);
							
							
							// AJAX UPDATE: SAVE AS (current_val, current_html)
							
							
							/*
				
							$.ajax({
								url: 'database/submit_session.php',
								type: 'POST',
								data: {
									"clinicianID": clinician,
									"patientID": patient,
									"session": null,
									"action": "new",
									"data": {
										"name": current_html,
										"range1dates": D3graph.getRange1dates(),
										"range2dates": D3graph.getRange2dates(),
										"settings": D3graph.getSettings()
									}
								},
								dataType: 'json',
								success: function(response) {
									// if (response.result == 1) 
										// notesSubmitted = false;
									console.log(response);
									D3graph.setSessChanged();
								},
								error: function() {
									window.alert('Error saving session.');
								}
							});
							
							
							*/
							
							
						// For RENAME form ... (they use the same form. the class denotes which function it's performing)
						} else if ($('#session-edit').hasClass('rename')) {
							// Get the name from the form
							option_name = nameVal;
							console.log(current_val);
							var renameVal = current_val.split('-')[1];
							console.log(renameVal);
							for (var i = 0; i < sessions.data.length; i++) {
								if (sessions.data[i].value == renameVal) {
									sessions.data[i].name = option_name;
								}
							}
							// set html of current value
							$('#session-mngr option[value="' + current_val + '"]').html(option_name);
							reset_modal();
							// changes current val to the new one
							current_val = $('#session-mngr').val();
							current_html = $('#session-mngr option[value="' + current_val + '"]').html();
							
							
							// AJAX UPDATE: RENAME (current_val, current_html)
							
							
							/*
							
							$.ajax({
								url: 'database/submit_session.php',
								type: 'POST',
								data: {
									"clinicianID": clinician,
									"patientID": patient,
									"session": renameName,
									"action": "rename",
									"data": {
										"name": current_html
									}
								},
								dataType: 'json',
								success: function(response) {
									// if (response.result == 1) 
										// notesSubmitted = false;
									console.log(response);
								},
								error: function() {
									window.alert('Error saving session.');
								}
							});
							
							*/
							
							
						}
					}
				}
			}
			return false;
		});
	};
	
	function addElements() {
		$('#cfg').append('<form id="ssForm" action="#">\
			<fieldset>\
				<label for="session">Saved sessions</label>\
				<select name="session" id="session-mngr" onchange="SessionSelect.ssGo();">\
					<option value="save" disabled="disabled">Save</option>\
					<option value="saveas">Save as...</option>\
					<option value="rename" disabled="disabled">Rename current</option>\
					<option value="delete" disabled="disabled">Delete current</option>\
					<option value="-">------------------</option>\
					<option value="default" selected="selected">Create New</option>\
				</select>\
			</fieldset>\
		</form>');
		
		if (sessions.data.length > 0) {
			for (var i = 0; i < sessions.data.length; i++) {
				$('#session-mngr').append('<option value="session-' + sessions.data[i].value + '">' + sessions.data[i].name + '</option>');
			}
			$('#session-mngr option').prop('disabled', false);
		}
		
		if (initialSession != 'Create New') {
			$('#session-mngr option').prop('selected', false);
			$('#session-mngr option').each(function() {
				if ($(this).html() == initialSession) 
					$(this).prop('selected', true);
			});
		}
		
		
		if ($('#overlay').length < 1) {
			$('body').append('<div id="overlay" style="display: none;">&nbsp;</div>\
				<div class="modal-wrapper" style="display: none;">\
					<div class="modal" id="session-modal">\
						<h2>SAVE AS</h2>\
						<form id="session-edit" action="#">\
							<fieldset>\
								<label for="name">Session name: </label>\
								<input type="text" id="name">\
								<input type="button" id="session-edit-submit" value="Ok">\
								<input type="button" id="session-edit-cancel" value="Cancel">\
							</fieldset>\
						</form>\
						<!-- end session-edit -->\
					</div>\
					<!-- end session-modal -->\
				</div>');
		}
	}
	
	var parseSessInfo = function(info) {	// ALERT: Going to incorporate this tomorrow
		if ($('#ssForm').length < 1) {
			// console.log(info);
			sessions = {
				nextID: 0,
				data: []
			};
			for (var i = 0; i < info.sessions.length; i++) {
				sessions.data.push({
					value: i,
					name: info.sessions[i]
				});
			}
			sessions.nextID = sessions.data.length;
			initialSession = info.current.name;
			addElements();
		}
	};
	
	var init = function() {
		// addElements();
	};
	
	return {
		ssGo: ssGo,
		parseSessInfo: parseSessInfo,
		init: init
	};
	
})();