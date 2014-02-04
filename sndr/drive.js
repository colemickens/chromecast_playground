var DRIVE_APP_ID = "619505613225"; // attr
var DRIVE_OAUTH_TOKEN = "ybh9_3PK29gyOPAhMAQj3nHG"; // attr

DRIVE_CLIENT_LOADED = false;
var DRIVE_PICKER_LOADED = false;
var DRIVE_OAUTH_TOKEN = false;
var DRIVE_ACTIVE = false;
var DRIVE_SCOPES = "https://www.googleapis.com/auth/drive";

function createPicker() {
    if (DRIVE_ACTIVE) {
        var view = new google.picker.View(google.picker.ViewId.DOCS);
        view.setMimeTypes("video/x-matroska,video/mp4");

        var picker = new google.picker.PickerBuilder()
            .enableFeature(google.picker.Feature.NAV_HIDDEN)
            .setAppId(DRIVE_APP_ID)
            .setOAuthToken(DRIVE_OAUTH_TOKEN)
            .addView(view)
            .setCallback(pickerCallback)
            .build();

        picker.setVisible(true);
    }
}

function setActive() {
    if (DRIVE_PICKER_LOADED && DRIVE_OAUTH_TOKEN && DRIVE_CLIENT_LOADED) {
        console.log("3");
        DRIVE_ACTIVE = true;

        //
        createPicker();
        //
    }
}

function onAuthApiLoad() {
    console.log("Called onAuthApiLoad");
    gapi.auth.authorize(
        {
        'client_id': DRIVE_APP_ID,
        'scope': DRIVE_SCOPES,
        'immediate': true,
        },
        handleAuthResult
    );
}

function onClientLoad() {
    DRIVE_CLIENT_LOADED = true;
}
    
function handleAuthResult(authResponse) {
    if (authResponse && !authResponse.error) {
        DRIVE_OAUTH_TOKEN = authResponse.access_token;
        setActive();
    }
}

function onPickerApiLoad() {
    DRIVE_PICKER_LOADED = true;
    setActive();
}

function pickerCallback(data) {
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
}
    
function drivestart() {
    gapi.load('auth', {'callback': onAuthApiLoad});
    gapi.load('picker', {'callback': onPickerApiLoad});
}