var CenterDiv = (function() {
	
	function setCd() {
		var ww = $(window).width();
		if (ww < 1330) 
			ww = 1330;
		var dw = $('#dw').width() + parseInt($('#dw').css('padding-left').split('px'));
		$('#dw').css('margin-left', (Math.round(((ww - dw) / 2))) + 'px');
	}
	
	var init = function() {
		setCd();
		$(window).resize(function() {
			setCd();
		});
	};
	
	return {
		init: init
	};
	
})();