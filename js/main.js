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

		// Mute button event
		$('.volume-control .volume-button').click(function(){
			console.log('TEST');
			if($(this).hasClass('fa-volume-up')) {
				$('.volume-control .volume-button').removeClass('fa-volume-up').addClass('fa-volume-off');
				player.playerElement.volume = 0;
			} else {
				$('.volume-control .volume-button').removeClass('fa-volume-off').addClass('fa-volume-up');
				player.setVolume();
			}
		});

		$(".volume-bar").slider({
			min: 0,
			max: 100,
			value: 100,
			range: "min",
			animate: true,
			slide: function(event, ui) {
				if(player.playingState == "Playing") {
					player.setVolume();
				}
			},
			change: function( event, ui ) {
				if(player.playingState == "Playing") {
					player.setVolume();
			}}
		});

		// Fix the player lenght to the same as the content
		$('.player-container').width($('#app-content-wrapper').width());
		$(window).resize(function() {
			$('.player-container').width($('#app-content-wrapper').width());
		});

		music.get_music();

		$('#music-scan').click(function () {
			music.scan_music();
		});

		$(player.playerElement).on('ended', function() {
			music.add_time_played_counter(player.currentSong.file_id);
			player.nextSong();
		});

		player.playerElement.ontimeupdate = function() {
			var progress = ((player.playerElement.currentTime*100)/player.playerElement.duration).toFixed(2);
			$('.seek-bar-progress').css('width',progress+"%");
			$('.seek-bar-ball').css('left',progress+"%");
			$('.current-time').text(music.second_to_duration(player.playerElement.currentTime.toFixed(0)));
			$('.duration-time').text(music.second_to_duration(player.playerElement.duration.toFixed(0)));
		};

		player.playerElement.onprogress = function() {
			if(player.playerElement.buffered.length > 0) {
				var bufferedEnd = player.playerElement.buffered.end(player.playerElement.buffered.length - 1);
				var duration =  player.playerElement.duration;
				var progress = ((bufferedEnd*100)/duration).toFixed(2);
				if (duration > 0) {
					$('.seek-bar-progress-buffered').css('width',progress+"%");
				}
			}
		};
		$('.song-title').marquee();
	});
})(jQuery, OC);