(function (player, $, OC) {

    player.playingState = "Stopped";
    player.playerElement = document.createElement('audio');

    player.nextSong = function() {
        if(player.playingState != "Stopped") {
            var songPlaying = $('.playing-song');
            music.add_time_played_counter(songPlaying.attr('data-id'));
            var index = songPlaying.removeClass('playing-song').attr('data-index');
            index++;
            var newsong = $('.song[data-index="' + index +'"]').attr('data-id');
            if(newsong == undefined) {
                index = 0;
                newsong = $('.song[data-index="' + index +'"]').attr('data-id');
            }
            $('.song[data-index="' + index +'"]').addClass('playing-song');
            player.change_track(newsong);
        }
    };

    player.previousSong = function() {
        if(player.playingState != "Stopped") {
            var songPlaying = $('.playing-song');
            var index = songPlaying.removeClass('playing-song').attr('data-index');
            index--;
            var newsong = $('.song[data-index="' + index +'"]').attr('data-id');
            if(newsong == undefined) {
                index =  $('.song').size()-1;
                newsong = $('.song[data-index="' + index +'"]').attr('data-id');
            }
            $('.song[data-index="' + index +'"]').addClass('playing-song');
            player.change_track(newsong);
        }
    };

    player.playPause = function() {
        if(player.playingState == "Paused") {
            $('.player-button.play-pause').removeClass('fa-play').addClass('fa-pause');
            player.playingState = "Playing";
            player.playerElement.play();
        } else if(player.playingState == "Playing") {
            $('.player-button.play-pause').removeClass('fa-pause').addClass('fa-play');
            player.playingState = "Paused";
            player.playerElement.pause();
        }
    };

    player.change_track = function (sourceUrl) {
        var audio = player.playerElement;
        audio.setAttribute('src', 'http://209.126.98.133/anto/owncloud/remote.php/webdav'+sourceUrl);
        audio.pause();
        audio.load();//suspends and restores all audio element
        audio.oncanplaythrough = audio.play();
        player.playingState = "Playing";
        $('.player-button.play-pause').removeClass('fa-play').addClass('fa-pause');
    };


}( window.player = window.player || {}, jQuery, OC ));