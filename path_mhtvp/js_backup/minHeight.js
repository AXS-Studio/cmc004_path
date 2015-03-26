var MinHeight = (function() {
	
	function setMh() {
		var wh = $(window).height();
		var mh = wh - (81 + 40);
		$('#mh').css('min-height', mh + 'px');
	}
	
	var init = function() {
		setMh();
		$(window).resize(function() {
			setMh();
		});
	};
	
	return {
		init: init
	};
	
})();