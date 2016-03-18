(function($){
	simpleRelatedPostsOption = 
	{
		init:function()
		{
			if ( !$('#sgamanual_original_css').is(':checked') ) {
				$("#sgamanual_original_css_content").css('display', 'none');
			}

			$('#sgamanual_original_css').click(function() {
				$("#sgamanual_original_css_content").slideToggle(this.checked);
			});
		}
	},
	$(document).ready(function ()	
    {
        simpleRelatedPostsOption.init();
    })
})(jQuery);