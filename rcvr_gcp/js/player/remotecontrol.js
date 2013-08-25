(function() {
  'use strict';

  log('Initializing Remote Control');
  chromekey.receiver.logger.setLevelValue(0);

  if ((window.navigator.userAgent.indexOf('CrKey') === -1) &&
      (window.navigator.userAgent.indexOf('TV') === -1)) {
    log('Cast is not supported for this device');
    window.player = new BasicPlayer(true);
    window.player.init();
    return;
  }

  var GenericPlayer = function() {
    this.player_ = new BasicPlayer();
    window.player = this.player_;
    this.castApp = new chromekey.receiver.Receiver(
        'GoogleCastPlayer',
        [chromekey.receiver.RemoteMedia.NAMESPACE],
        "",
        5);
    this.remoteMedia = new chromekey.receiver.RemoteMedia();
    this.remoteMedia.addChannelFactory(
        this.castApp.createChannelFactory(
        chromekey.receiver.RemoteMedia.NAMESPACE));
    this.remoteMedia.setMediaElement(this.player_.getMediaElement());
    var loadCallback = function(channel, message) {
      dlog(2, 'OnLoad src: ' + message.src);

      if (message.content_info) {
        options.level = message.content_info.level;
        options.algorithm = message.content_info.algorithm;
        options.cc = message.content_info.cc;
      }

      // TODO (afontan) change options to boolean
      options.autoplay = message.autoplay.toString();

      if (message.src) {
        options.url = message.src;
        options.level = message.level;
        this.player_.init();
      }

      this.remoteMedia.setImageUrl(message.image_url);
      this.remoteMedia.setTitle(message.title);
      this.remoteMedia.setContentInfo(message.content_info);

      //TODO (afontan): Make asynchronous and handle errors
      this.remoteMedia.sendSuccessResponse(channel, message, true);
    };

    this.remoteMedia.onLoad = loadCallback.bind(this);
  };

  var gp = new GenericPlayer();

  gp.castApp.start();

  window.castApp = gp.castApp;

})();






