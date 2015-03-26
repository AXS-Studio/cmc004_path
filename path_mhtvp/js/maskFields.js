var MaskFields = (function() {

	function maskPhone(id) {
		$('#' + id).mask("(999) 999-9999");
	}
	
	var init = function(id) {
		$('input').each(function() {
			var id = $(this).attr('id');
			if ($(this).hasClass('phone')) {
				maskPhone(id);
			}
		});
	};
	
	return {
		init: init
	};
	
})();