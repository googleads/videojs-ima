var video, player;

module('Ad Framework', {
  setup: function() {
    video = document.createElement('video');
    video.id = 'video';
    document.getElementById('qunit-fixture').appendChild(video);
    player = videojs(video);
  },
  teardown: function() {
  }
});

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
    player.ima.start();
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
  }, 6000);
});
