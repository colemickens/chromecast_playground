// Copyright 2013 Google Inc. All Rights Reserved.

/**
 * @fileoverview Provides the logic for adaptive streaming.
 *
 * @author afontan@google.com (Antonio Fontan)
 */

(function() {

  'use strict';

  // https://en.wikipedia.org/wiki/Moving_average
  var kSlowEWMACoeff = 0.99;
  var kFastEWMACoeff = 0.98;
  var globalSlowBandwidth = 500000;
  var globalFastBandwidth = 500000;

  var AdaptiveManager = function(bitrates, algorithm, level) {
    this.bitrates_ = bitrates;
    this.levelCount_ = this.bitrates_.length;
    this.algorithm_ = algorithm;
    this.cooldownPeriod_ = 2;
    if (level) {
      this.level_ = parseInt(level);
    }
  };

  AdaptiveManager.prototype.onBandwithTracking = function(evt) {
    var xhr = evt.target;
    if (xhr.lastTime != null && evt.timeStamp != xhr.lastTime) {

      var bw = 8000 * (evt.loaded - xhr.lastSize) /
          (evt.timeStamp - xhr.lastTime);
      globalSlowBandwidth = kSlowEWMACoeff *
          globalSlowBandwidth + (1 - kSlowEWMACoeff) * bw;
      globalFastBandwidth = kFastEWMACoeff *
          globalFastBandwidth + (1 - kFastEWMACoeff) * bw;
    }
    xhr.lastTime = evt.timeStamp;
    xhr.lastSize = evt.loaded;
    dlog(2, 'Calculated bandwidth: ' +
        globalSlowBandwidth + ' ' + globalFastBandwidth);
  };

  AdaptiveManager.prototype.adapt = function(
      currentLevel, low_buffering_modifier) {
    if (!this.bitrates_ || (this.bitrates_.length <= 1)) {
      return -1;
    }

    var level = -1;
    if (this.algorithm_ === 'fixed') {
      level = this.level_;
    }
    else if (this.algorithm_ === 'random') {
      if (Math.random() > 0.5) {
        level = Math.floor(Math.random() * this.levelCount_);
      }
    }
    else if (this.algorithm_ === 'adaptive') {
      if (this.cooldownPeriod_) {
        this.cooldownPeriod_--;
      }
      else {
        var bestBw = 0;
        var best = 0;
        // multiplier:
        // TODO (afontan): Right now we are not using this as we need to
        // experiment more with different quality levels
        // low_buffering_modifier = 0 -> multiplier: 0.85
        // low_buffering_modifier = 1 -> multiplier: 0.60
        // low_buffering_modifier = 2 -> multiplier: 0.35
        var multiplier = 0.85 - 0.25 * low_buffering_modifier;
        if (low_buffering_modifier) {
          dlog(2, 'Low buffering modifier used: ' + low_buffering_modifier);
        }

        var gbw = Math.min(globalSlowBandwidth, globalFastBandwidth);
        dlog(5, 'Calculated Bandwidth: ' + gbw + ' globalSlowBandwidth: ' +
            globalSlowBandwidth + ' globalFastBandwidth: ' +
            globalFastBandwidth);

        for (var i = 0; i < this.bitrates_.length; i++) {
          var bw = this.bitrates_[i];

          if (bw > bestBw && bw < (multiplier * gbw - 128000)) {
            bestBw = bw;
            best = i;
          }
        }

        if (best !== currentLevel) {
          dlog(2, 'Selected new rate ' + bestBw + ' for bandwidth ' + gbw +
              ' (from ' + globalSlowBandwidth + ', ' +
              globalFastBandwidth + ')');
          this.cooldownPeriod_ = 8;
          return best;
        }
      }
    }

    if ((currentLevel !== level) && (level !== -1)) {
      dlog(2, 'Selected new bitrate level: ' + level);
      return level;
    }

    return -1;
  };

  window.AdaptiveManager = AdaptiveManager;

})();
