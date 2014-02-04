var caststuff = {
    RCVR_APP_ID: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,

    session: undefined,
    media = undefined,

    start: function() {
        if (!chrome.cast || !chrome.cast.isAvailable) {
            setTimeout(start, 1000);
        }
    },

    initializeCastApi: function() {
        var sessionRequest = new chrome.cast.SessionRequest(RCVR_APP_ID);
        var apiConfig = new chrome.cast.ApiConfig(sessionRequest, sessionListener, receiverListener);
        chrome.cast.initialize(apiConfig, onInitSuccess, onError);
    },

    receiverListner: function(e) {
        if ( e === 'available' ) {
            chrome.cast.requestSession(onRequestSessionSuccess, onLaunchError);
        }
    },

    sessionListener: function(s) {
        session = s;
    },

    onRequestSessionSuccess: function(castSession) {
        session = castSession;
    }

    launchUrl: function(url) {
        if (session) {
            var mediaInfo = new chrome.cast.media.MediaInfo(url);
            var request = new chrome.cast.media.LoadRequest(mediaInfo);
            session.loadMedia(request, onMediaDiscovered, onMediaError);
        }
    },

    onMediaDiscovered: function(m) {
        media = m;
        media.addUpdateListener(onMediaStatusUpdate);
    },

    onMediaStatusUpdate: function(e) {
        console.log(e);
    },

    onMediaError: function(e) {
        console.log(e);
    },



















    doLaunch = function(receiver) {
      var request = new cast.LaunchRequest(RECEIVER_ID, receiver);
      request.parameters = "v=abcdefg";
      request.description = new cast.LaunchDescription();
      request.description.text = "My Cat Video";
      request.description.url = "...";
      cast_api.launch(request, onLaunch);
    };

    onLaunch = function(activity) {
      if (activity.status == "running") {
        cv_activity = activity;
        console.log("running");
        // update UI to reflect that the receiver has received the
        // launch command and should start video playback.
      } else if (activity.status == "error") {
        cv_activity = null;
        console.log("error");
        console.log(activity);
      }
    };

    mediaLoaded = function(stuff) {
        console.log("mediaLoaded callback:", stuff);

        request = cast.MediaPlayRequest();
        cast_api.playMedia(cv_activity.activityId, request, mediaPlaying);
    }

    mediaPlaying = function(stuff) {
        console.log("mediaPlaying callback:", stuff);
    }

    stopPlayback = function() {
      if (cv_activity) {
        cast_api.stopActivity(cv_activity.activityId, function() {});
      }
    };

    $("#button0").click(function() {
        initializeApi();
    });

    $("#button1").click(function() {
        stopPlayback();
    });

    $("#link0").click(function() {
        var suffix = prompt("Enter the blob dl suffix","sha1-e23ab65c092ebb912293f5a93d6058e82b8a1e12/Nasa%20Tv%20Spot.mp4");
        var url = CAMLISTORE_PREFIX + suffix;
        console.log("playing ", url);
        playVideo(url, {}, true, "blobby!");
    });

    $("#link1").click(function() {
        console.log("opening picker");
        createPicker();
    });

    playDropboxFile = function(dbFile) {
        playVideo(dbFile.link, {}, true, dbFile.name);
    };

    playDriveFile = function(drFile) {
        playVideo(drFile.webContentLink, {}, true, drFile.title);
        //playVideo(drFile.downloadUrl, {}, true, drFile.title);
    };

    playVideo = function(url, contentInfo, autoplay, title) {
        var request = new cast.MediaLoadRequest(url);
        request.contentInfo = contentInfo;
        request.autoplay = autoplay;
        request.title = title;
        console.log("loadMedia:", request);
        cast_api.loadMedia(cv_activity.activityId, request, mediaLoaded);
        console.log("post load media");
    };

    document.getElementById("db-chooser").addEventListener("DbxChooserSuccess",
        function(e) {
            playDropboxFile(e.files[0]);
        },
        false
    );

    
    $("filepicker").click(function() {
        gauth();
    });
});
