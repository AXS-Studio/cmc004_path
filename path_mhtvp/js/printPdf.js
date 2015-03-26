var PrintPdf = (function() {
	
	// Cindy's
	function post_to_url(path, params, method) {
		method = method || 'post'; // Set method to post by default if not specified.
	
		// The rest of this code assumes you are not using a library.
		// It can be made less wordy if you use one.
		var form = document.createElement('form');
		form.setAttribute('id', 'postForm');
		form.setAttribute('method', method);
		form.setAttribute('action', path);
		form.setAttribute('action', path);
	
		for (var key in params) {
			if (params.hasOwnProperty(key)) {
				var hiddenField = document.createElement('input');
				hiddenField.setAttribute('type', 'hidden');
				hiddenField.setAttribute('name', key);
				hiddenField.setAttribute('value', params[key]);
				form.appendChild(hiddenField);
			 }
		}
	
		document.body.appendChild(form);
		form.submit();
		$('#postForm').remove();
	}
	
	function compileHtml(patient, graphCont) {
		var html = '<!DOCTYPE html>\
			<!--[if lt IE 7]> <html class="no-js lt-ie9 lt-ie8 lt-ie7" lang="en"> <![endif]-->\
			<!--[if IE 7]>    <html class="no-js lt-ie9 lt-ie8" lang="en"> <![endif]-->\
			<!--[if IE 8]>    <html class="no-js lt-ie9" lang="en"> <![endif]-->\
			<!--[if IE 9]>	  <html class="no-js ie9" lang="en"> <![endif]-->\
			<!--[if gt IE 8]><!--> <html class="no-js" lang="en"> <!--<![endif]-->\
				<head>\
					<meta charset="utf-8">\
					<title>PATH</title>\
					<meta name="robots" content="noindex, nofollow">\
					<link rel="stylesheet" media="screen" href="css/pdf.css">\
				</head>';
			html += '<body>\
					<header>\
						<h1><strong>PATH</strong></h1>\
						<img width="189" height="47" alt="Sunnybrook Research Institute" src="images/logo_sunnybrook_research_institute.gif">\
					</header>';
			html += '<div class="minHeight" id="mh">\
						<article class="grapher">\
							<form class="clearfloat" action="#" id="dataVisForm">\
								<fieldset>\
									<label for="PatientDropdown">Patient:</label> <strong>' + patient + '</strong>\
								</fieldset>\
							</form>';
			html += '<div class="containerForGraphs" id="cfg">\
								<div id="cfgGraphs">' + graphCont + '</div>\
							</div>\
						</article>\
					</div>\
				</body>\
			</html>';
		// console.log(html);
		/*$.ajax({
			type: 'POST',
			url: 'database/submit_print.php',
			data: {
				"html": html
			},
			dataType: 'json',
			success: function(json) {
				
			},
			error: function() {
				window.alert('Error!');
			}
		});*/
		/*$.post('database/submit_print.php', {"html": html}).done(function() {
			window.open('database/submit_print.php', 'pdf');
		});*/
		// Cindy's
		post_to_url('database/submit_print.php', {
			"html": html
		});
	}
	
	var init = function() {
		var patient = $('#PatientDropdown option:selected').html(),
			graphCont = $('#cfgGraphs').html();
		compileHtml(patient, graphCont);
	};
	
	return {
		init: init
	};
	
})();