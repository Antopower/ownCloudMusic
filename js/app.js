(function (music, $, OC) {

    music.get_music = function () {
        var url = OC.generateUrl('/apps/musicapi/getmusic');
        var data = {};
        $.post(url, data).success(function (response) {
            music.render_songlist(response.data.songs);
        });
    };

    music.add_time_played_counter = function (index) {
        var url = OC.generateUrl('/apps/musicapi/addtimeplayed');
        var data = {fileid: index};
        $.post(url, data).success(function (response) {});
    };

    music.scan_music = function () {
        var url = OC.generateUrl('/apps/musicapi/scandrivemusic');
        var data = {};
        $.post(url, data).success(function (response) {
            if (response.success == true) {
                music.get_music();
            }
        });
    };

    music.second_to_duration = function (second) {
        if(second == 'NaN') {
            minutes = '00';
            seconds = '00';
        } else {
            var sec_num = parseInt(second); // don't forget the second param
            var hours   = Math.floor(sec_num / 3600);
            var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
            var seconds = sec_num - (hours * 3600) - (minutes * 60);

            if (minutes < 10) {minutes = "0"+minutes;}
            if (seconds < 10) {seconds = "0"+seconds;}
        }
        return minutes+':'+seconds;
    };

    music.render_songlist = function (response) {
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
        response.forEach( function (song)
        {
            songlist += '<tr data-index="' + songindex + '" data-id="' + song.file_id + '" class="song">';
            songlist += '<td class="songlist-title">'+ song.title +'</td>';
            songlist += '<td class="songlist-artist">'+ song.artist +'</td>';
            songlist += '<td class="songlist-album">'+ song.album +'</td>';
            songlist += '<td class="songlist-genre">'+ song.genre +'</td>';
            songlist += '<td class="songlist-year">'+ song.year +'</td>';
            songlist += '<td class="songlist-bitrate">'+ parseInt(song.bitrate/1000) +'kbps</td>';
            songlist += '<td class="songlist-playtime">'+ song.play_time +'</td>';
            songlist += '<td class="songlist-timeplayed">'+ song.time_played +'</td>';
            songlist += '</tr>';
            songindex = songindex + 1;
        });
        songlist += '</tbody></table>';
        $('#songlist').html(songlist);
        music.musicList = response;
        $('tr.song').click(function(){
            load_track = $(this).attr('data-path');//gets me the url of the new track
            $('.playing-song').removeClass('playing-song');
            $(this).addClass('playing-song');
            player.change_track($(this).attr('data-id'));// function to change the track of the loaded audio player without page refresh preferred...
        });
        return songlist;
    };

}( window.music = window.music || {}, jQuery, OC ));