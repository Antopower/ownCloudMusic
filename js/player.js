(function (player, $, OC) {

    player.playingState = "Stopped";
    player.playerElement = document.createElement('audio');

    player.nextSong = function() {
        alert('Next song!');
    };

    player.previousSong = function() {
        alert('Previous song!');
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
        } else {
            return;
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