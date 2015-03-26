var DataVisualizationSelect = (function() {
	
	var selectChanged = function(ajaxPath) {
		// console.log(ajaxPath);
		patient = ajaxPath.split('=')[1];
		// console.log(patient);
		if (ajaxPath != 'Select patient') {
			if ($('#ssForm').length > 0) 
				$('#ssForm').remove();
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
			$.ajax({
				url: ajaxPath,
				type: 'GET',
				dataType: 'json',
				success: function(response) {
					initialData = response;
					// console.log(initialData);
					D3graph.init();
					// SessionSelect.init();
				},
				error: function() {
					window.alert('Error Select Changed!');
				}
			});
		}
	};
	
	function create() {
		var results = $.ajax({
			type: 'GET',
			url: 'database/create_list.php',
			data: {
				"retrieve": "patientListQueryAnswersInitial"
			}
		}).success(function($response) {
			$('#PatientDropdown').html('<option value="Select patient">--Select a patient--</option>' + $response);
		});
	}
	
	var init = function() {
		$.ajax({
			url: 'database/query_questions.php',
			type: 'GET',
			dataType: 'json',
			success: function(response) {
				questions = response;
				// console.log(questions);
			},
			error: function() {
				window.alert('Error Querry Questions!');
			}
		});
		create();
	};
	
	return {
		selectChanged: selectChanged,
		init: init
	};
	
})();