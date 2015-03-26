var LoginFooter = (function() {
	
	function setWidth() {
		var width = $(window).width();
		if (width < 1330) 
			width = 1330;
		var height = $(window).height();
		$('#wrapper').css('height', height + 'px');
		$('footer').css('width', width + 'px');
	}
	
	var init = function() {
		setWidth();
		$(window).resize(function() {
			setWidth();
		});
	};
	
	return {
		init: init
	};
	
})();