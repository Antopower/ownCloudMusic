(function (music, $, OC) {

    music.get_music = function () {
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
                player.change_track(load_track);// function to change the track of the loaded audio player without page refresh preferred...
            });
        });
    };

    music.add_time_played_counter = function (index) {
        var url = OC.generateUrl('/apps/musicapi/addtimeplayed');
        var data = {fileid: index};
        $.post(url, data).success(function (response) {

        });
    };

    music.show_music_files = function () {
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
                player.change_track(load_track);// function to change the track of the loaded audio player without page refresh preferred...
            });
        });
    };

}( window.music = window.music || {}, jQuery, OC ));