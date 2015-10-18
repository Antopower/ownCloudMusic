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

		// Play/Pause event
		$('.player-button.backward').click(function(){
			player.previousSong();
		});

		// Play/Pause event
		$('.player-button.forward').click(function(){
			player.nextSong();
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
			player.nextSong();
		});
	});
})(jQuery, OC);