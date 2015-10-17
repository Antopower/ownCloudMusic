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

		// On document ready, generate song list
		// **** TEMPORARY ****
		get_music();

		$('#music-scan').click(function () {
			show_music_files();
		});

		$("#player").on('ended', function() {
			var songPlaying = $('.playing-song');
			console.log(songPlaying.attr('data-id'));
			add_time_played_counter(songPlaying.attr('data-id'));
			var index = songPlaying.removeClass('playing-song').attr('data-index');
			index++;
			var newsong = $('.song[data-index="' + index +'"]').attr('data-path');
			if(newsong == undefined) {
				index = 0;
				newsong = $('.song[data-index="' + index +'"]').attr('data-path');
			}
			$('.song[data-index="' + index +'"]').addClass('playing-song');
			change_track(newsong);
		});

		function get_music() {
			var url = OC.generateUrl('/apps/musicapi/getmusic');
			var data = {};
			$.post(url, data).success(function (response) {
				var song;
				var songindex = 0;
				var songlist = '<table style="width:100%">' +
					'<thead>' +
					'<th>Title</th>' +
					'<th>Artist</th>' +
					'<th>Album</th>' +
					'<th>Genre</th>' +
					'<th>Year</th>' +
					'<th>Bitrate</th>' +
					'<th>Time</th>' +
					'<th>Time played</th>' +
					'</thead>'+
					'<tbody>';
				response.data.songs.forEach( function (song)
				{
					songlist += '<tr data-path="'+ song.path +'" data-index="' + songindex + '" data-id="' + song.file_id + '" class="song">';
					songlist += '<td>'+ song.title +'</td>';
					songlist += '<td>'+ song.artist +'</td>';
					songlist += '<td>'+ song.album +'</td>';
					songlist += '<td>'+ song.genre +'</td>';
					songlist += '<td>'+ song.year +'</td>';
					songlist += '<td>'+ parseInt(song.bitrate/1000) +'kbps</td>';
					songlist += '<td>'+ song.play_time +'</td>';
					songlist += '<td>'+ song.time_played +'</td>';
					songlist += '</tr>';
					songindex = songindex + 1;
				});
				songlist += '</tbody></table>';
				$('#songlist').html(songlist);

				$('tr.song').click(function(){
					load_track = $(this).attr('data-path');//gets me the url of the new track
					$('.playing-song').removeClass('playing-song');
					$(this).addClass('playing-song');
					change_track(load_track);// function to change the track of the loaded audio player without page refresh preferred...
				});
			});
		}

		function show_music_files() {
			var url = OC.generateUrl('/apps/musicapi/scandrivemusic');
			var data = {};
			$.post(url, data).success(function (response) {
				var song;
				var songlist = '<table style="width:100%">' +
					'<thead>' +
					'<th>Title</th>' +
					'<th>Artist</th>' +
					'<th>Album</th>' +
					'<th>Genre</th>' +
					'<th>Year</th>' +
					'<th>Bitrate</th>' +
					'<th>Time</th>' +
					'<th>Time played</th>' +
					'</thead>'+
					'<tbody>';
				console.log(response.songlist);
				response.songlist.forEach( function (song)
				{
					songlist += '<tr data-path="'+ song.path +'" class="song">';
					songlist += '<td>'+ song.title +'</td>';
					songlist += '<td>'+ song.artist +'</td>';
					songlist += '<td>'+ song.album +'</td>';
					songlist += '<td>'+ song.genre +'</td>';
					songlist += '<td>'+ song.year +'</td>';
					songlist += '<td>'+ parseInt(song.bitrate/1000) +'kbps</td>';
					songlist += '<td>'+ song.play_time +'</td>';
					songlist += '<td>'+ song.time_played +'</td>';
					songlist += '</tr>';
				});
				songlist += '</tbody></table>';
				$('#songlist').html(songlist);

				$('tr.song').click(function(){
					load_track = $(this).attr('data-path');//gets me the url of the new track
					$('.playing-song').removeClass('playing-song');
					$(this).addClass('playing-song');
					change_track(load_track);// function to change the track of the loaded audio player without page refresh preferred...
				});
			});
		}

		function change_track(sourceUrl) {
			var audio = $("#player");
			$("#mp3-src").attr("src", "http://209.126.98.133/anto/owncloud/remote.php/webdav"+sourceUrl);
			/****************/
			audio[0].pause();
			audio[0].load();//suspends and restores all audio element

			//audio[0].play(); changed based on Sprachprofi's comment below
			audio[0].oncanplaythrough = audio[0].play();
			/****************/
		}

		function add_time_played_counter(index) {
			var url = OC.generateUrl('/apps/musicapi/addtimeplayed');
			var data = {fileid: index};
			$.post(url, data).success(function (response) {

			});
		}

	});
})(jQuery, OC);