/**
 * ownCloud - musicapi
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Anto Martel <amartel@quatral.com>
 * @copyright Anto Martel 2015
 */

(function ($, OC) {

	$(document).ready(function () {

		// Play/Pause event
		$('.player-button.play-pause').click(function(){
			player.playPause();
		});

		// Fix the player lenght to the same as the content
		$('.player-container').width($('#app-content-wrapper').width());
		$(window).resize(function() {
			$('.player-container').width($('#app-content-wrapper').width());
		});

		music.get_music();

		$('#music-scan').click(function () {
			music.show_music_files();
		});

		$("#player").on('ended', function() {
			var songPlaying = $('.playing-song');
			music.add_time_played_counter(songPlaying.attr('data-id'));
			var index = songPlaying.removeClass('playing-song').attr('data-index');
			index++;
			var newsong = $('.song[data-index="' + index +'"]').attr('data-path');
			if(newsong == undefined) {
				index = 0;
				newsong = $('.song[data-index="' + index +'"]').attr('data-path');
			}
			$('.song[data-index="' + index +'"]').addClass('playing-song');
			music.change_track(newsong);
		});
	});
})(jQuery, OC);