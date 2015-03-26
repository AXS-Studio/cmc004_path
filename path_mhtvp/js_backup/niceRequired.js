var NiceRequired = (function() {
	
	function textInputTextColour(id) {
		var attrValue = $('#' + id).attr('value');
		$('#' + id).focus(function() {
			if ($(this).attr('value') == attrValue) {
				$(this).attr('value', '');
				$(this).css('color', '#000');
			}
		});
		$('#' + id).blur(function() {
			if ($(this).attr('value') == '') {
				$(this).attr('value', attrValue);
				$(this).css('color', '#666');
			}
		});
	}
	
	function textAreaTextColour(id) {
		var attrValue = $('#' + id).val();
		$('#' + id).focus(function() {
			if ($(this).val() == attrValue) {
				$(this).val('');
				$(this).css('color', '#000');
			}
		});
		$('#' + id).blur(function() {
			if ($(this).val() == '') {
				$(this).val(attrValue);
				$(this).css('color', '#666');
			}
		});
	}
	
	var init = function() {
		
	};
	
	return {
		init: init
	};
	
})();