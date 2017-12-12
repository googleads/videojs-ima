var video, player;
var setup = function() {
  video = document.createElement('video');
  video.id = 'video';
  document.getElementById('qunit-fixture').appendChild(video);
  player = videojs(video);
};


module('Ad Framework', { setup: setup });

test('the environment is sane', function() {
  ok(true, 'true is ok');
});

test('video plays on bad ad tag', function() {
  var options = {
    id: 'video',
    adTagUrl: 'http://this.site.does.not.exist.google.com'
  };
  player.ima(options);
  var playCount = 0;
  player.play = function() {
    playCount++;
  }
  player.ima.initializeAdDisplayContainer();
  player.ima.requestAds();
  player.play();
  stop();
  setTimeout(function() {
    // Play called once by the plugin on error.
    equal(playCount, 1);
    start();
  }, 5000);
});

test('controls prefixed with id', function(){
  var options = {
    id: 'video',
    adTagUrl: 'http://pubads.g.doubleclick.net/gampad/ads?sz=640x360&' +
    'iu=/6062/iab_vast_samples/skippable&ciu_szs=300x250,728x90&impl=s&' +
    'gdfp_req=1&env=vp&output=xml_vast2&unviewed_position_start=1&' +
    'url=[referrer_url]&correlator=[timestamp]'
  };
  player.ima(options);
  player.ima.initializeAdDisplayContainer();
  player.ima.requestAds();

  ok(document.getElementById(options.id+'_ima-controls-div'), 'Controls should be generated with ID prefix');
  strictEqual(document.getElementById('ima-controls-div'), null, 'Controls without ID prefix should not be generated');
});

test('ad plays on good ad tag', function() {
  var options = {
    id: 'video',
    adTagUrl: 'http://pubads.g.doubleclick.net/gampad/ads?sz=640x360&' +
        'iu=/6062/iab_vast_samples/skippable&ciu_szs=300x250,728x90&impl=s&' +
        'gdfp_req=1&env=vp&output=xml_vast2&unviewed_position_start=1&' +
        'url=[referrer_url]&correlator=[timestamp]'
  }
  player.ima(options);
  var contentPauseCount = 0;
  player.ima.onContentPauseRequested_ = function() {
    contentPauseCount++;
  }
  player.ima.initializeAdDisplayContainer();
  player.ima.requestAds();
  player.play();
  stop();
  setTimeout(function() {
    equal(contentPauseCount, 1);
    start();
  }, 5000);
});

test('video continues after ad was skipped', function() {
  var options = {
    id: 'video',
    adTagUrl: 'http://pubads.g.doubleclick.net/gampad/ads?sz=640x360&' +
        'iu=/6062/iab_vast_samples/skippable&ciu_szs=300x250,728x90&impl=s&' +
        'gdfp_req=1&env=vp&output=xml_vast2&unviewed_position_start=1&' +
        'url=[referrer_url]&correlator=[timestamp]'
  }

  //addEventListener only works when the adManager is available, thus using it in the ready-callback
  var readyForPrerollCallback = function() {
    player.ima.addEventListener(google.ima.AdEvent.Type.SKIPPABLE_STATE_CHANGED, function() {
      var adManager = this;
      adManager.skip();
    })
    //we overwrote the normal ready-callback, thus calling start now
    player.ima.startFromAdsManagerLoadedCallback();
  };

  player.ima(options, readyForPrerollCallback);

  var contentResumeCount = 0;
  player.ima.onContentResumeRequested_ = function() {
    contentResumeCount++;
  }
  var adCompleteCount = 0;
  player.ima.onAdComplete_ = function() {
    adCompleteCount++;
  }

  player.ima.initializeAdDisplayContainer();
  player.ima.requestAds();
  player.play();
  stop();

  setTimeout(function() {
    equal(contentResumeCount, 1, 'content resumed');
    equal(adCompleteCount, 1 , 'adComplete was called');
    start();
  }, 10000);
});

test('autoplay attribute is automatically copied as a setting from video element', function() {
  var autoplayVideo, autoplayPlayer;
  var options = {
    id: 'autoplay-player',
    adTagUrl: 'http://pubads.g.doubleclick.net/gampad/ads?sz=640x360&' +
    'iu=/6062/iab_vast_samples/skippable&ciu_szs=300x250,728x90&impl=s&' +
    'gdfp_req=1&env=vp&output=xml_vast2&unviewed_position_start=1&' +
    'url=[referrer_url]&correlator=[timestamp]'
  };
  autoplayVideo = document.createElement('video');
  autoplayVideo.setAttribute('autoplay', 'autoplay');
  autoplayVideo.setAttribute('id', 'autoplay-player');

  document.getElementById('qunit-fixture').appendChild(autoplayVideo);
  autoplayPlayer = videojs(autoplayVideo);


  autoplayPlayer.ima(options);
  autoplayPlayer.ima.initializeAdDisplayContainer();
  equal(autoplayPlayer.ima.settings.adWillAutoPlay, true, 'autoplay attribute copied to settings')
})


module("Events", { setup: setup });

test('onAdsLoaderError_ should trigger adserror with data from google.ima.AdError and google.ima.AdErrorEvent', function() {
  var options = {
    id: 'video',
    adTagUrl: ''
  };

  player.on("adserror", function(event){
    deepEqual(Object.keys(Object(event.data)), ["AdError", "AdErrorEvent"], "event.data should have AdError and AdErrorEvent");

    if (event.data) {
      ok(event.data.AdError, "AdError should be defined");
      ok(event.data.AdErrorEvent, "AdErrorEvent should be defined");
    }

    start();
  });

  player.ima(options);
  player.ima.requestAds();

  stop();
});

test('onAdError_ should trigger adserror with data from google.ima.AdError and google.ima.AdErrorEvent', function() {
  // stub view mode to throw on start
  google.ima.ViewMode.NORMAL = "throw-on-ads-manager-init";

  var options = {
    id: 'video',
    adTagUrl: 'http://pubads.g.doubleclick.net/gampad/ads?sz=640x360&' +
        'iu=/6062/iab_vast_samples/skippable&ciu_szs=300x250,728x90&impl=s&' +
        'gdfp_req=1&env=vp&output=xml_vast2&unviewed_position_start=1&' +
        'url=[referrer_url]&correlator=[timestamp]',
    autoPlayAdBreaks: true,
  };

  player.on("adserror", function(event){
    deepEqual(Object.keys(Object(event.data)), ["AdError", "AdErrorEvent"], "event.data should have AdError and AdErrorEvent");

    if (event.data) {
      ok(event.data.AdError, "AdError should be defined");
      ok(event.data.AdErrorEvent, "AdErrorEvent should be defined");
    }

    start();
  });

  player.ima(options);
  player.ima.requestAds();
  player.play();

  stop();
});
