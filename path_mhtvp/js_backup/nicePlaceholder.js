var NicePlaceholder = (function() {
	
	function placeholder(id, password) {
		var attrValue = $('#' + id).attr('placeholder');
		if (password) 
			$('#' + id).attr('type', 'text');
		$('#' + id).removeAttr('placeholder').val(attrValue).css('color', '#808080').focus(function() {
			if ($(this).val() == attrValue) {
				if (password) 
					$(this).attr('type', 'password');
				$(this).val('').css('color', '#000');
			}
		}).blur(function() {
			if ($(this).val() == '') {
				if (password) 
					$(this).attr('type', 'text');
				$(this).val(attrValue).css('color', '#808080');
			}
		});
	}
	
	var init = function() {
		// if ($('html').hasClass('ie9')) {
			$('input, textarea').each(function() {
				if ($(this).attr('placeholder')) {
					var id = $(this).attr('id');
					if ($(this).attr('type') != 'password') 
						placeholder(id);
					else 
						placeholder(id, true);
				}
			});
		// }
	};
	
	return {
		init: init
	};
	
})();