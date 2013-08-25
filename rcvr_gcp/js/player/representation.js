/**
 * @fileoverview Wrapper for SourceBuffer to manage initialization and caching.
 * @author afontan@google.com (Antonio Fontan)
 */

(function() {

  'use strict';

  var Representation = function(
      url, bandwidth, width, height, sps, pps, codecs) {
    this.url = url;
    // tODO (afontan): Change name to bitrate
    this.bandwidth = bandwidth;
    this.width = width;
    this.height = height;
    this.sps = sps;
    this.pps = pps;
    this.codecs = codecs;
    this.initFragment = null;
    this.initRequestData = null;
    this.indexRequestData = null;
    this.isInitialized = false;
    this.segs = null;
  };

  window.Representation = Representation;

})();
