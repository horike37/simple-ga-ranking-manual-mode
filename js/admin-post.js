(function($){
	sgaManualRanking = 
	{
		init:function()
		{
			//postboxes.add_postbox_toggles("sga_ranking");
			this.keyup();
			this.sortable();
			this.remove();
			this.submit();
			this.reset();
		},
		
		sortable: function()
		{
			$( '.sgamanual_relationship .relationship_right .relationship_list' ).sortable();
		},
		
		keyup:function()
		{
			$('.sgamanual_relationship .relationship_left .relationship_search').keyup(function(e){
				var param = {
					action: 'sgamanual_search_posts',
					s: $(this).val()
				}
				$.post(ajaxurl, param, function(ret) {
					if ( ret == '' ) {
						return false;
					}

					var output = '';
					$.each(ret, function(index, item) {
						var title = '';
						
						if ( item.post_thumbnail != '' ) {
							title += '<div class="result-thumbnail">'+item.post_thumbnail+'</div>';
						}
						title += item.post_title;
						
						output += '<li><a class="" data-post_id="'+item.ID+'" href="'+item.permalink+'"><span class="title">'+title+'</span><span class="sgamanual-button"></span></a></li>' + "\n";
					});
					$('.sgamanual_relationship .relationship_left .relationship_list').html(output);
					sgaManualRanking.add();
					$('.sgamanual_relationship .relationship_right .relationship_list li').each(function(index, item) {
      					$('.sgamanual_relationship .relationship_left .relationship_list li').each(function(index_2, item_2) {
      						if($(item).children('a').attr('data-post_id') == $(item_2).children('a').attr('data-post_id')) {
	      						$(item_2).addClass('hide');
		  					}
		  				});
		  			});
				},'json');
			});
		},
		
		add: function()
		{
			$('.sgamanual_relationship .relationship_left .relationship_list li a').on( 'click', function(e){
			 	e.preventDefault();
			 	
			 	var post_id = $(this).attr('data-post_id'), flg = true;

      			$('.sgamanual_relationship .relationship_right .relationship_list li').each(function(index, item) {
      				if ( (index+1) >= sga_ranking_display_num ) {
	      				alert('よく読まれる記事の上限は %d個です'.replace('%d', sga_ranking_display_num));
	      				flg = false;
      				}
      			
      				if($(item).children('a').attr('data-post_id') == post_id) {
      					flg = false;
		  			}
      			});
	  			
	  			if (flg) {
					$(this).closest('li').clone(false).prependTo('.sgamanual_relationship .relationship_right .relationship_list').css('background-color', '#EAF2FA').animate({
						backgroundColor: "#FFFFF",
					}, 1200);
					$(this).closest('li').addClass('hide');
					sgaManualRanking.remove();
      			}
			});
		},
		
		remove: function()
		{

			$('.sgamanual_relationship .relationship_right .relationship_list li a .sgamanual-button').on( 'click', function(e){
			 	e.preventDefault();
			 	$(this).closest('li').fadeOut("slow").queue(function () {
					$(this).remove();
      			});
      			
      			var post_id = $(this).closest('a').attr('data-post_id');
      			$('.sgamanual_relationship .relationship_left .relationship_list li').each(function(index, item) {
      				if($(item).children('a').attr('data-post_id') == post_id) {
	      				$(item).removeClass('hide');
      				}
      			});
      			
			});
		},
		
		submit: function()
		{
			$('#sga-post').submit(function(){
				$('.sgamanual_relationship .relationship_right .relationship_list li').each(function(index, item) {
					$('<input />').attr('type', 'hidden')
					.attr('name', 'sga_ranking_options[manual_ranking][]')
					.attr('value', $(item).children('a').attr('data-post_id'))
					.appendTo('#sga-post');
				});
			});
		},
		
		reset: function()
		{
			$('.sgamanual_relationship .relationship_right #sgamanual-reset').on('click', function(e){
				var param = {
					action: 'sgamanual_reset_related_posts'
				}
				$.post(ajaxurl, param, function(ret) {
					if ( ret == '' ) {
						return false;
					}

					var output = '';
					$.each(ret, function(index, item) {
						var title = '';
						
						if ( item.post_thumbnail != '' ) {
							title += '<div class="result-thumbnail">'+item.post_thumbnail+'</div>';
						}
						title += item.post_title;
						
						output += '<li><a class="" data-post_id="'+item.ID+'" href="'+item.permalink+'"><span class="title">'+title+'</span><span class="sgamanual-button"></span></a></li>' + "\n";
					});
					$('.sgamanual_relationship .relationship_left .relationship_list').html(output);
					sgaManualRanking.remove();
					$('.sgamanual_relationship .relationship_left .relationship_list').css('background-color', '#EAF2FA').animate({
						backgroundColor: "#FFFFF",
					}, 1200);
					sgaManualRanking.add();
				},'json');
			});
		}
		
	},
	$(document).ready(function ()	
    {
        sgaManualRanking.init();
    })
})(jQuery);