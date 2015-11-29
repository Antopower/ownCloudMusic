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

		$(player.playerElement).on("error", function (e) {
			$('.player-button.play-pause').css('color','#D6D6D6');
			$('.radio-modal-error').text('This source is not compatible with the player.');
			$('#internet-radio').click();
		});

		music.get_music();

		// Menu Buttons
		$('#music-scan').click(function () {
			music.scan_music();
		});

		// Internet radio modal
		$('#internet-radio').click(function () {
			modal_init();
			$('.radio-modal').css('display','inline-block');
			$(window).resize();
			$('#radio-url').focus();
		});

		$('#setting-internet-radio').click(function () {
			$('#menu-internet-radio').css('display', 'block');
		});

		// Internet radio modal GO
		$('.radio-go-btn').click(function () {
			music.get_radio_song_information($('.radio-modal #radio-url').val(),true);
		});

		// Modal cancel
		$('.modal-cancel').click(function () {
			modal_close();
			$('.radio-modal-error').text('');
		});

		// Modal init function
		var modal_init = function() {
			$('#app-modal').css('display','inline-block').addClass('modal-opened');
			$('#app-modal-wrapper').css('display','inline-block');
		};

		var modal_close = function() {
			$('#app-modal').css('display','none').removeClass('modal-opened');;
			$('.music-app-modal').css('display','none');
		};

		$(window).resize(function(){
			if ($('#app-modal').hasClass('modal-opened')) {
				$('#app-modal-wrapper').css({
					position:'absolute',
					left: ($(window).width() - $('#app-modal-wrapper').outerWidth())/2,
					top: (($(window).height() - $('#app-modal-wrapper').outerHeight())/2) - $('#header').outerHeight()
				});
			}
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