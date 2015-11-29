(function (player, $, OC) {

    player.playingState = "Stopped";
    player.RadioState = "Stopped";
    player.repeat = "0";
    player.shuffle = false;
    player.playerElement = document.createElement('audio');
    player.radioInterval = false;

    player.nextSong = function() {
        if(player.playingState != "Stopped") {
            if(player.repeat == "0") {
                var index = $('.playing-song').removeClass('playing-song').attr('data-index');
                if(player.shuffle) {
                    index = Math.floor((Math.random() * $('.song').size()) + 0);
                    console.log($('.song').size());
                    console.log(index);
                    var newsong = $('.song[data-index="' + index +'"]').addClass('playing-song').attr('data-id');
                } else {
                    index++;
                    if($('.song[data-index="' + index +'"]').attr('data-id') == undefined) {
                        index = 0;
                    }
                    var newsong = $('.song[data-index="' + index +'"]').addClass('playing-song').attr('data-id');
                }
                player.change_track(newsong);
            } else if(player.repeat == "1") {
                player.playerElement.pause();
                player.playerElement.load();//suspends and restores all audio element7
                player.playerElement.oncanplaythrough = player.playerElement.play();
            }
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
        if (player.RadioState == 'Playing') {
            $('.player-button.play-pause').removeClass('fa-stop').removeClass('fa-pause').addClass('fa-play');
            player.RadioState = 'Paused';
            player.playerElement.load();
        } else if (player.RadioState == 'Paused') {
            $('.player-button.play-pause').removeClass('fa-play').removeClass('fa-pause').addClass('fa-stop');
            player.RadioState = 'Playing';
            player.playerElement.play();
        } else {
            if(player.playingState == "Paused") {
                $('.player-button.play-pause').removeClass('fa-play').removeClass('fa-stop').addClass('fa-pause');
                player.playingState = "Playing";
                player.playerElement.play();
            } else if(player.playingState == "Playing") {
                $('.player-button.play-pause').removeClass('fa-pause').removeClass('fa-stop').addClass('fa-play');
                player.playingState = "Paused";
                player.playerElement.pause();
            }
        }
    };

    player.change_track = function (file_id) {
        var audio = player.playerElement;
        player.currentSong = $.grep(music.musicList, function(e){ return e.file_id == file_id; })[0];
        audio.setAttribute('preload', 'none');
        audio.setAttribute('type', 'audio/mp3');
        audio.setAttribute('src', 'http://209.126.98.133/anto/owncloud/remote.php/webdav' + player.currentSong.path);
        audio.pause();
        audio.load();//suspends and restores all audio element
        audio.play();
        player.playingState = "Playing";
        player.RadioState = "Stopped";
        player.enable_button();
        if(player.radioInterval != false) {
            clearInterval(player.radioInterval);
            player.radioInterval = false;
        }
        player.setVolume();
        $('.player-button.play-pause').removeClass('fa-play').removeClass('fa-stop').addClass('fa-pause');
        $('.scrolling-text .song-title').text(player.currentSong.title);
        $('.song-artist').text(player.currentSong.artist);
        $('.seek-bar-ball').css('left',"0%");
        $('.seek-bar-progress').css('width',"0%");
        $('.current-time').text(music.second_to_duration(player.playerElement.currentTime.toFixed(0)));
        $('.duration-time').text(music.second_to_duration(player.playerElement.duration.toFixed(0)));
    };

    player.play_radio = function (url) {
        var audio = player.playerElement;
        audio.setAttribute('preload', 'none');
        audio.setAttribute('src', url);
        audio.pause();
        audio.load();
        audio.play();
        player.playingState = "Stopped";
        player.RadioState = "Playing";
        player.setVolume();
        player.disable_button();
        $('.player-button.play-pause').removeClass('fa-play').removeClass('fa-pause').addClass('fa-stop');
        $('.playing-song').removeClass('playing-song');
        music.get_radio_song_information(url);
        if(player.radioInterval != false) {
            clearInterval(player.radioInterval);
        }
        player.radioInterval = setInterval(function(){ music.get_radio_song_information(url) }, 30000);
        $('.duration-time').text('00:00');
        $('.song-artist').text('');
    };

    player.setVolume = function() {
        if(player.playingState == "Playing" && $('.volume-control .volume-button').hasClass('fa-volume-up')) {
            var volume = $('.volume-bar').slider("option", "value");
            player.playerElement.volume = volume/100;
        }
    };

    player.disable_button = function() {
        $('.player-button.backward').css('color','#D6D6D6');
        $('.player-button.forward').css('color','#D6D6D6');
        $('.player-button.repeat').css('color','#D6D6D6');
        $('.player-button.shuffle').css('color','#D6D6D6');
    };

    player.enable_button = function() {
        $('.player-button.backward').css('color','');
        $('.player-button.forward').css('color','');
        $('.player-button.repeat').css('color','');
        $('.player-button.shuffle').css('color','');
        $('.player-button.play').css('color','');
    };

}( window.player = window.player || {}, jQuery, OC ));