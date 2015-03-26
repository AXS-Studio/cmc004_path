var d3SessionChanged = false;

var SessionSelectFix = (function() {
	
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
	
	var initialSession = 'Create New';
	var lastVal = null;
	var formSubmitted = false;
	var nameTaken = false;
	var validName = /^([a-zA-Z0-9\s_-]+)$/;
	
	function resetNameForm() {
		$('#overlay').fadeOut(500);
		$('div.modal-wrapper').fadeOut(500);
		$('#name').val('');
		$('#session-edit').removeClass('saveAs', 'rename');
	}
	
	function setUpNameForm(actionVal) {
		// show grey overlay
		$('#overlay').fadeIn(500);
		// adds hook so we know waht this form is doing (rename/saveAs)
		$('#session-edit').addClass(actionVal);
		// adds the title
		$('#session-modal h2').html($('#sessSelect option[value="' + actionVal + '"]').html());
		if (actionVal == 'saveAs') 
			$('#name').val('untitled_session_' + (sessions.nextID + 1));
		// if we're renaming, it pre-populates the modals text field with the last selected value
		else if (actionVal == 'rename') 
			$('#name').val($('#sessSelect option[value="' + lastVal + '"]').html());
		$('div.modal-wrapper').fadeIn(500);
	}
	
	function getCurrVal() {
		// console.log('The current value is ' + $('#sessSelect').val());
		return $('#sessSelect').val();
	}
	
	function setSS(val) {
		$('#sessSelect').val(val);
		// $('#sessSelect option[val="' + val + '"]').prop('selected', true);
		lastVal = val;
		// console.log(val + ' is has just been successfully set as the current value');
	}
	
	function ssAjax(action, session, sessData) {
		var url = null;
		var data = {};
		switch (action) {
			case 'save' : 
				url = 'database/submit_session.php';
				data = {
					action: 'save',
					clinicianID: clinician,
					patientID: patient,
					session: session,
					data: sessData
				};
				break;
			case 'saveAs' : 
				url = 'database/submit_session.php';
				data = {
					action: 'new',
					clinicianID: clinician,
					patientID: patient,
					session: session,
					data: sessData
				};
				break;
			case 'rename' : 
				url = 'database/submit_session.php';
				data = {
					action: 'rename',
					clinicianID: clinician,
					patientID: patient,
					session: session,
					data: sessData
				};
				break;
			case 'delete' : 
				url = 'database/submit_session.php';
				data = {
					action: 'delete',
					clinicianID: clinician,
					patientID: patient,
					session: session
				};
				break;
			default : 
				url = 'database/query_answers_initial.php';
				if (session == 'Create New') {
					data = {
						patientID: patient
					};
				} else {
					data = {
						patientID: patient,
						sessionName: session
					};
				}
		}
		$.ajax({
			url: url,
			type: 'POST',
			data: data,
			dataType: 'json',
			success: function(response) {
				switch (action) {
					case 'save' : 
						// console.log(response);
						D3graph.setSessChanged();
						break;
					case 'saveAs' : 
						// console.log(response);
						D3graph.setSessChanged();
						break;
					case 'rename' : 
						// console.log(response);
						break;
					case 'delete' : 
						// console.log(response);
						ssAjax('get', 'Create New');
						break;
					default : 
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
				}
			},
			error: function() {
				window.alert('Save Session error.');
			}
		});
	}
	
	function setSessEditForm() {
		$('#session-edit-cancel').on('click', function() {
			resetNameForm();
			setSS(lastVal);
			return false;
		});
		$('#session-edit-submit').on('click', function() {
			if (formSubmitted == false) {
				formSubmitted = true;
				nameTaken = false;
				var nameVal = $('#name').val();
				// Remove all of the spaces at the beginning of the name if there are any
				while (nameVal.charAt(0) == ' ') 
					nameVal = nameVal.substr(1);
				// Remove all of the spaces at the end of the name if there are any
				while (nameVal.charAt(nameVal.length - 1) == ' ') 
					nameVal = nameVal.substr(0, nameVal.length - 1);
				if (nameVal == '') {
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
						// If the action is “Save as”...
						if ($('#session-edit').hasClass('saveAs')) {
							// Add a new session object to the sessions array
							sessions.data.push({
								"value": sessions.nextID,
								"name": nameVal
							});
							// add the option to the selector
							$('#sessSelect').append('<option value="session-' + sessions.nextID + '">' + nameVal + '</option>');
							// Make sure any options that are marked as selected or disabled are cleared as such
							$('#sessSelect option').prop('selected', false).prop('disabled', false);
							// set our new session as the selected one
							setSS('session-' + sessions.nextID);
							// up the incremental id by 1
							sessions.nextID++;
							resetNameForm();
							ssAjax('saveAs', $('#sessSelect option[value="' + lastVal + '"]').html(), {	// ALERT: Ajax saveAs
								range1dates: D3graph.getRange1dates(),
								range2dates: D3graph.getRange2dates(),
								settings: D3graph.getSettings()
							});
							setTimeout(function() {
								window.alert('Your new session ”' + nameVal + '” has been saved.');
								formSubmitted = false;
							}, 500);
						// If the action is “Rename”...
						} else if ($('#session-edit').hasClass('rename')) {
							var originalName = null;
							var renameVal = lastVal.split('-')[1];
							jQuery.each(sessions.data, function(i, s) {
								if (s.value == renameVal) {
									originalName = s.name;
									s.name = nameVal;
								}
							});
							// set html of current value
							$('#sessSelect option[value="' + lastVal + '"]').html(nameVal);
							setSS(lastVal);
							resetNameForm();
							ssAjax('rename', originalName, {	// ALERT: Ajax rename
								name: $('#sessSelect option[value="' + lastVal + '"]').html()
							});
							setTimeout(function() {
								formSubmitted = false;
							}, 250);
						}
					}
				}
			}
			return false;
		});
	}
	
	function disableActions() {
		$('#sessSelect option[value="save"], #sessSelect option[value="rename"], #sessSelect option[value="delete"]').prop('disabled', true);
	}
	
	function loadNewSession(val) {
		// console.log(val);
		if (val == 'session-default') {
			/*var getData = {
				"patientID": patient
			};*/
			disableActions();
		} else {
			/*var getData = {
				"patientID": patient,
				"sessionName": current_htmltext
			};*/
			$('#sessSelect option').prop('selected', false).prop('disabled', false);
		}
		setSS(val);
		ssAjax('get', $('#sessSelect option[value="' + lastVal + '"]').html());	// ALERT: Ajax get
	}
	
	var ssGo = function() {
		var changedVal = getCurrVal();
		switch (changedVal) {
			case 'save' : 
				setSS(lastVal);
				window.alert('Your current session “' + $('#sessSelect option[value="' + lastVal + '"]').html() + '” has been saved.');
				ssAjax('save', $('#sessSelect option[value="' + lastVal + '"]').html(), {	// ALERT: Ajax save
					range1dates: D3graph.getRange1dates(),
					range2dates: D3graph.getRange2dates(),
					settings: D3graph.getSettings()
				});
				break;
			case 'saveAs' : 
				setUpNameForm(changedVal);
				// Form actions for “Save as...” are in setSessEditForm()
				break;
			case 'rename' : 
				setUpNameForm(changedVal);
				// Form actions for “Rename current” are in setSessEditForm()
				break;
			case 'delete' : 
				var delConf = window.confirm('Are you sure you want to delete this session?');
				if (delConf == true) {
					var deleteVal = lastVal.split('-')[1];
					for (var i = 0; i < sessions.data.length; i++) {
						if (sessions.data[i].value == deleteVal) {
							sessions.data.splice(i, 1);
						}
					}
					// console.log(sessions.data);
					if (sessions.data.length < 1) {
						// $('#session-mngr').append(defaultOpt);
						$('#sessSelect option[value="save"], #sessSelect option[value="rename"], #sessSelect option[value="delete"]').prop('disabled', true);
					}
					window.alert('The session titled “' + $('#sessSelect option[value="' + lastVal + '"]').html() + '” has been deleted.');
					// So the "DELETE" doesn't show
					// setSS(lastVal);
					// Removes the one selected to be dleeted.
					$('#sessSelect option[value="' + lastVal + '"]').remove();
					ssAjax('delete', $('#sessSelect option[value="' + lastVal + '"]').html());	// ALERT: Ajax delete
					// changes current val to the new one selected now as a reuslt of deletion.
					var newVal = $('#sessSelect option[value="-"]').next('option').val();	// ALERT: This may be determined by the Ajax
					if (newVal == 'session-default') 
						disableActions();
					setSS(newVal);
				} else 
					setSS(lastVal);
				break;
			case '-' : 
				setSS(lastVal);
				break;
			default : 
				// var sessionChanged = D3graph.getSessChanged();
				var sessionChanged = d3SessionChanged;
				if (sessionChanged == true) {
					var changeConf = window.confirm('You have unsaved changes. Are you sure you want to switch to a different session?');
					if (changeConf == true) 
						loadNewSession($('#sessSelect').val());
					else 
						setSS(lastVal);
				} else 
					loadNewSession($('#sessSelect').val());
		}
	};
	
	function ssStart() {
		$('#cfg').append('<form id="ssForm" action="#">\
				<fieldset>\
					<label for="session">Saved sessions</label>\
					<select name="session" id="sessSelect" onchange="SessionSelectFix.ssGo();">\
						<option value="save" disabled="disabled">Save</option>\
						<option value="saveAs">Save as...</option>\
						<option value="rename" disabled="disabled">Rename current</option>\
						<option value="delete" disabled="disabled">Delete current</option>\
						<option value="-">------------------</option>\
						<option value="session-default">Create New</option>\
					</select>\
					<!-- end sessSelect -->\
				</fieldset>\
			</form>');
		
		if (sessions.data.length > 0) {
			for (var i = 0; i < sessions.data.length; i++) {
				$('#session-mngr').append('<option value="session-' + sessions.data[i].value + '">' + sessions.data[i].name + '</option>');
			}
		}
		
		if (initialSession != 'Create New') {
			$('#ssForm option').prop('selected', false);
			$('#ssForm option').each(function() {
				if ($(this).html() == initialSession) 
					setSS($(this).attr('value'));
			});
		} else 
			setSS('session-default');
		
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
	
	var init = function() {
		ssStart();
		setSessEditForm();
	};
	
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
			init();
		}
	};
	
	return {
		ssGo: ssGo,
		init: init,
		parseSessInfo: parseSessInfo
	};
	
})();