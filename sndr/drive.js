var drivestuff = {
    appId: "619505613225", // attr
    oauthToken: "ybh9_3PK29gyOPAhMAQj3nHG", // attr

    pickerLoaded: false,
    oauthToken: false,
    active: false,
    scopes: "https://www.googleapis.com/auth/drive",

    createPicker: function() {
        if (active) {
            var view = new google.picker.View(google.picker.ViewId.DOCS);
            view.setMimeTypes("video/x-matroska,video/mp4");

            var picker = new google.picker.PickerBuilder()
                .enableFeature(google.picker.Feature.NAV_HIDDEN)
                .setAppId(appId)
                .setOAuthToken(oauthToken)
                .addView(view)
                .setCallback(pickerCallback)
                .build();

            picker.setVisible(true);
        }
    },

    setActive: function() {
        if (pickerLoaded && oauthToken) {
            active = true;
        }
    }

    onAuthApiLoad: function() {
        console.log("Called onAuthApiLoad");
        gapi.auth.authorize(
            {
            'client_id': appId,
            'scope': scopes,
            'immediate': true,
            },
            handleAuthResult
        );
    },
    
    handleAuthResult: function(authResponse) {
        if (authResponse && !authResponse.error) {
            oauthToken = authResponse.access_token;
            setActive();
        }
    }
    
    onPickerApiLoad: function() {
        pickerLoaded = true;
        setActive();
    },

    pickerCallback: function(data) {
        console.log(data);
        var url = 'nothing';
        if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
            var doc = data[google.picker.Response.DOCUMENTS][0];
            url = doc[google.picker.Document.URL];
        }
        if (url != 'nothing') {
            var request = gapi.client.drive.files.get({
                'fileId': fileId
            });
            request.execute(function(file) {
                console.log(file);
                playDriveFile(file);
            }); 
        }
    },
    
    start: function() {
        gapi.load('auth' {'callback': onAuthApiLoad});
        gapi.load('picker' {'callback': onPickerApiLoad});
    },
}