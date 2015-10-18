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

		// Play/Pause button event
		$('.player-button.play-pause').click(function(){
			player.playPause();
		});

		// Play/Pause button event
		$('.player-button.backward').click(function(){
			player.previousSong();
		});

		// Play/Pause button event
		$('.player-button.forward').click(function(){
			player.nextSong();
		});

		// Repeat button event
		$('.player-button.repeat').click(function(){
			if(player.repeat == "0") {
				player.repeat = "1";
				$('.player-button.repeat').addClass('mpc');
			} else if(player.repeat == "1") {
				player.repeat = "0";
				$('.player-button.repeat').removeClass('mpc');
			}
		});

		// Shuffle button event
		$('.player-button.shuffle').click(function(){
			if(player.shuffle) {
				player.shuffle = false;
				$('.player-button.shuffle').removeClass('mpc');
			} else {
				player.shuffle = true;
				$('.player-button.shuffle').addClass('mpc');
			}
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

		$(player.playerElement).on('ended', function() {
			music.add_time_played_counter(player.currentSong.file_id);
			player.nextSong();
		});
	});
})(jQuery, OC);