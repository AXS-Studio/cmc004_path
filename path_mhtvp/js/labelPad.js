var LabelPad = (function() {
	
	function setLp() {
		var lp = $('#dw label').width() + 10;
		$('#dw').css('padding-left', lp + 'px');
	}
	
	var init = function() {
		setLp();
	};
	
	return {
		init: init
	};
	
})();