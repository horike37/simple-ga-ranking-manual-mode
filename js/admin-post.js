(function($){
	simpleRelatedPosts = 
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
			$( '.sirp_relationship .relationship_right .relationship_list' ).sortable();
		},
		
		keyup:function()
		{
			$('.sirp_relationship .relationship_left .relationship_search').keyup(function(e){
				var param = {
					action: 'sirp_search_posts',
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
						
						output += '<li><a class="" data-post_id="'+item.ID+'" href="'+item.permalink+'"><span class="title">'+title+'</span><span class="sirp-button"></span></a></li>' + "\n";
					});
					$('.sirp_relationship .relationship_left .relationship_list').html(output);
					simpleRelatedPosts.add();
					$('.sirp_relationship .relationship_right .relationship_list li').each(function(index, item) {
      					$('.sirp_relationship .relationship_left .relationship_list li').each(function(index_2, item_2) {
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
			$('.sirp_relationship .relationship_left .relationship_list li a').on( 'click', function(e){
			 	e.preventDefault();
			 	
			 	var post_id = $(this).attr('data-post_id'), flg = true;

      			$('.sirp_relationship .relationship_right .relationship_list li').each(function(index, item) {
      				if ( (index+1) >= sga_ranking_display_num ) {
	      				alert('よく読まれる記事の上限は %d個です'.replace('%d', sga_ranking_display_num));
	      				flg = false;
      				}
      			
      				if($(item).children('a').attr('data-post_id') == post_id) {
      					flg = false;
		  			}
      			});
	  			
	  			if (flg) {
					$(this).closest('li').clone(false).prependTo('.sirp_relationship .relationship_right .relationship_list').css('background-color', '#EAF2FA').animate({
						backgroundColor: "#FFFFF",
					}, 1200);
					$(this).closest('li').addClass('hide');
					simpleRelatedPosts.remove();
      			}
			});
		},
		
		remove: function()
		{

			$('.sirp_relationship .relationship_right .relationship_list li a .sirp-button').on( 'click', function(e){
			 	e.preventDefault();
			 	$(this).closest('li').fadeOut("slow").queue(function () {
					$(this).remove();
      			});
      			
      			var post_id = $(this).closest('a').attr('data-post_id');
      			$('.sirp_relationship .relationship_left .relationship_list li').each(function(index, item) {
      				if($(item).children('a').attr('data-post_id') == post_id) {
	      				$(item).removeClass('hide');
      				}
      			});
      			
			});
		},
		
		submit: function()
		{
			$('#sga-post').submit(function(){
				$('.sirp_relationship .relationship_right .relationship_list li').each(function(index, item) {
					$('<input />').attr('type', 'hidden')
					.attr('name', 'sga_ranking_options[manual_ranking][]')
					.attr('value', $(item).children('a').attr('data-post_id'))
					.appendTo('#sga-post');
				});
			});
		},
		
		reset: function()
		{
			$('.sirp_relationship .relationship_right #sirp-reset').on('click', function(e){
				var param = {
					action: 'sirp_reset_related_posts'
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
						
						output += '<li><a class="" data-post_id="'+item.ID+'" href="'+item.permalink+'"><span class="title">'+title+'</span><span class="sirp-button"></span></a></li>' + "\n";
					});
					$('.sirp_relationship .relationship_left .relationship_list').html(output);
					simpleRelatedPosts.remove();
					$('.sirp_relationship .relationship_left .relationship_list').css('background-color', '#EAF2FA').animate({
						backgroundColor: "#FFFFF",
					}, 1200);
					simpleRelatedPosts.add();
				},'json');
			});
		}
		
	},
	$(document).ready(function ()	
    {
        simpleRelatedPosts.init();
    })
})(jQuery);