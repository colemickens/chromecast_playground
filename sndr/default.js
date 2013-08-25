$(document).ready(function() {
	console.log("loaded");

	var cast_api, cv_activity; 
	var initialized = false;

	var CAMLISTORE_PREFIX = "http://admin:pass3179@camli.mickens.us/ui/download/";

	var RECEIVER_ID = "cb202d13-45e5-4a2f-8516-b8dab5120a78";
	//var RECEIVER_ID = "GoogleCastSampleApp";
	//var RECEIVER_ID = "GoogleCastPlayer";
	//var RECEIVER_ID = "GoogleCastPlayer";

	/*if (cast && cast.isAvailable) {
	  // Cast is known to be available
	  initializeApi();
	} else {
	  // Wait for API to post a message to us
	  window.addEventListener("message", function(event) {
	    if (event.source == window && event.data && 
	        event.data.source == "CastApi" &&
	        event.data.event == "Hello")
	      initializeApi();
	  });
	};
*/

	window.addEventListener("message", function(event) {
	    if (event.source == window && event.data && 
	        event.data.source == "CastApi" &&
	        event.data.event == "Hello")
	    {
	    	console.log("removing attribute...");
	    	initialized = true;
	    	$("#button0").removeAttr("disabled");
	    }
	});


	initializeApi = function() {
	  console.log("initializing");
	  cast_api = new cast.Api();
	  cast_api.addReceiverListener(RECEIVER_ID, onReceiverList);
	};

	onReceiverList = function(list) {
	  // If the list is non-empty, show a widget with
	  // the friendly names of receivers.
	  // When a receiver is picked, invoke doLaunch with the receiver.
	  console.log(list);
	  if(list.length > 0) {
	  	receiver = list[0];
	  	doLaunch(receiver);
	  }
	};

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
