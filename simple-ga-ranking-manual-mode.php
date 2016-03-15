<?php
/*
Plugin Name: Simple GA Ranking Manual Mode
Author: Horike Takahiro
Plugin URI: https://digitalcube.jp
Description: Simple GA Rankingにヤラセの機能を追加します
Version: 1.0
Author URI: https://digitalcube.jp
Domain Path: /languages
Text Domain:
*/

add_filter( 'sga_ranking_ids', function( $post_ids ) {
       $option = get_option( 'sga_ranking_options' );
       if ( empty($option['manual_ranking']) ) {
               $ranking = $post_ids;
       } else {
               $ranking = $option['manual_ranking'];
               $ranking = array_slice( $ranking, 0, $option['display_count'] );
       }
       return $ranking;
} );

function sga_ranking_get_date_manual( $args = array() ) {
	$option = get_option( 'sga_ranking_options' );
	if ( empty($option['manual_ranking']) ) {
		$ranking = sga_ranking_get_date( $args );
	} else {
		$ranking = $option['manual_ranking'];
	}
	
	if ( empty($ranking) || !is_array($ranking) ) {
		return;
	}
	$ranking = array_slice( $ranking, 0, $option['display_count'] );
	return $ranking;
}

function sga_ranking_meta_box() {
?>
<div class="sirp_relationship">
	<!-- Left List -->
	<div class="relationship_left">
		<table class="widefat">
			<thead>
				<tr>
					<th>
						<input class="relationship_search" placeholder="<?php _e("検索..."); ?>" type="text" />
					</th>
				</tr>
			</thead>
		</table>
		<ul class="relationship_list">
			<li class="load-more">
			</li>
		</ul>
	</div>
	<!-- /Left List -->
	
	<!-- Right List -->
	<div class="relationship_right">
		<h3><?php _e("ランキングとして表示される記事"); ?><input type="button" id="sirp-reset" class="button-secondary" value="<?php _e('正しいランキングを取得'); ?>" /></h3>
		<ul class="bl relationship_list">
		<?php
			$related_posts = sga_ranking_get_date_manual();
			
			if ( !empty($related_posts) ) {
				foreach( $related_posts as $post_id ) {
					$image = get_the_post_thumbnail( $post_id, array(21, 21) );
					
					$title = ''; 
					if ( !empty($image) )
						$title .= '<div class="result-thumbnail">' . $image . '</div>';
	
					$title .= get_the_title($post_id);
					
					echo '<li>
						<a href="' . get_permalink($post_id) . '" class="" data-post_id="' . $post_id . '"><span class="title">' . $title . '</span><span class="sirp-button"></span></a>
					</li>';					
				}	
			}		
		?>
		</ul>
	</div>
	<!-- / Right List -->
	
</div>
<?php
}

add_action( 'admin_init', function() {
	add_meta_box( 
    'sga_ranking',
    __( 'ランキング手動管理' ),
    'sga_ranking_meta_box',
    'sga_ranking' );
});

class Simple_GA_Ranking_Manual_Mode {
	public function __construct() {
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
		add_action( 'wp_ajax_sirp_search_posts', array( $this, 'sirp_search_posts' ) );
		add_action( 'wp_ajax_sirp_reset_related_posts', array( $this, 'sirp_reset_related_posts' ) );
		add_action( 'admin_footer', array( $this, 'admin_footer' ) );
		add_filter( 'sga_ranking_options_validate', array( $this, 'sga_ranking_options_validate' ), 10, 2 );
	}
	
	public function sga_ranking_options_validate( $new, $input ) {
		if ( is_array( $input['manual_ranking'] ) ) {
			foreach ( $input['manual_ranking'] as $key => $val ) {
				$new['manual_ranking'][$key] = absint( $val );
			}
		}

		return $new;
	}

    public function admin_enqueue_scripts() {
    	wp_enqueue_script( 'jquery' );
        wp_enqueue_script( 'jquery-ui' );
		wp_enqueue_script( 'jquery-ui-sortable' );
		wp_enqueue_script( 'postbox' );
        wp_register_style( 'sgamanual-admin-css', plugins_url() . '/' . dirname( plugin_basename( __FILE__ ) ) . '/css/style.css', array(), date('YmdHis', filemtime(dirname( __FILE__ ) . '/css/style.css')) );
        wp_enqueue_style( 'sgamanual-admin-css' );
        wp_register_script( 'sgamanual-admin-post-js', plugins_url() . '/' . dirname( plugin_basename( __FILE__ ) ) . '/js/admin-post.js', array(), date('YmdHis', filemtime(dirname( __FILE__ ) . '/js/admin-post.js')) );
        wp_enqueue_script( 'sgamanual-admin-post-js' );
        wp_register_script( 'sgamanual-color-js', plugins_url() . '/' . dirname( plugin_basename( __FILE__ ) ) . '/js/jquery.color.js', array(), date('YmdHis', filemtime(dirname( __FILE__ ) . '/js/jquery.color.js')) );
        wp_enqueue_script( 'sgamanual-color-js' );
    }
    
    public function sirp_reset_related_posts() {
    	if ( !function_exists('sga_ranking_get_date') ) {
    		return;
    	}
    
	    $results = sga_ranking_get_date();

		if ( empty($results) ) {
			return;
		}

		foreach ( $results as $id ) {
			$json[$cnt]['ID'] = $id;
			$json[$cnt]['post_title'] = get_the_title($id);
			$image = get_the_post_thumbnail( $id, array(21, 21) );
			$json[$cnt]['post_thumbnail'] = !empty($image) ? $image : '';
			$json[$cnt]['permalink'] = get_permalink($id);
			$cnt++;
		}
		echo json_encode($json);
		exit;
    }
    
    public function sirp_search_posts() {
    	if ( !isset($_POST['s']) )
    		return;
		
		$resutls = $this->search($_POST['s']);
		if ( empty($resutls) )
			return;
		$json = array();
		$cnt  = 0;
		foreach ( $resutls as $ret ) {
			$json[$cnt]['ID'] = $ret->ID;
			$json[$cnt]['post_title'] = get_the_title($ret->ID);
			$image = get_the_post_thumbnail( $ret->ID, array(21, 21) );
			$json[$cnt]['post_thumbnail'] = !empty($image) ? $image : '';
			$json[$cnt]['permalink'] = get_permalink($ret->ID);
			$cnt++;
		}
		echo json_encode($json);
		exit;
    }
	
	public function search($s) {
		global $wpdb;
		$sql = $wpdb->prepare( "SELECT SQL_CALC_FOUND_ROWS ID FROM " . $wpdb->posts . " WHERE (((post_title LIKE '%%%s%%') OR (post_content LIKE '%%%s%%'))) AND " . $wpdb->posts .".post_type = 'post' AND post_status = 'publish' ORDER BY post_title LIKE '%%%s%%' DESC, post_date DESC LIMIT 0, 10", $s, $s, $s );
		
		return $wpdb->get_results($sql);
	}

	public function admin_footer(){
		$options = get_option( 'sga_ranking_options' );
?>
<script type="text/javascript">
	var sga_ranking_display_num = <?php echo esc_js( $options['display_count'] ); ?>;
</script>
<?php
	}
}
new Simple_GA_Ranking_Manual_Mode();
