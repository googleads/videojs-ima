# IMA SDK Plugin for Video.js

[![Build Status](https://travis-ci.org/googleads/videojs-ima.svg?branch=master)](https://travis-ci.org/googleads/videojs-ima) [![BrowserStack Status](https://www.browserstack.com/automate/badge.svg?badge_key=N1g3U09HWEhZR09OSVc2YmhiWFlGaExMQmswMmo0Z1F3NVRjT0VvZCtWST0tLUo0QUdnZ1gyMmhJUHZsRGJ3dTBpWWc9PQ==--b8066916a46dd2f255b416f80f40ca7c3518ad46)](https://www.browserstack.com/automate/public-build/N1g3U09HWEhZR09OSVc2YmhiWFlGaExMQmswMmo0Z1F3NVRjT0VvZCtWST0tLUo0QUdnZ1gyMmhJUHZsRGJ3dTBpWWc9PQ==--b8066916a46dd2f255b416f80f40ca7c3518ad46)

## Introduction
The IMA SDK Plugin for Video.js provides a quick and easy IMA SDK integration
for the Video.js player.

To see the plugin in action, check out our
[samples](//googleads.github.io/videojs-ima/).

## Features
- Easily integrate the Google IMA SDK into Video.js to enable advertising on
your video content.

## Requirements
  - Your favorite text editor
  - A JavaScript enabled browser

## Getting started

### ES6 Imports
The easiest way to get started is by using [npm](//www.npmjs.org/).

```
npm install videojs-ima
```

Your index.html should contain the video.js stylesheet (not included in the npm module),
a video player to be used for playback, and script tags for the IMA SDK and your own
javascript file.

```html
<html>
  <head>
    <!-- Load dependent stylesheets. -->
    <link href="path/to/video-js.css" rel="stylesheet">
  </head>

  <body>
    <video id='content-player' class="video-js">
        <p class='vjs-no-js'>
            To view this video, please enable JavaScript and consider upgrading to a web browser that
            <a href='https://videojs.com/html5-video-support/' target='_blank'>supports HTML5 video</a>
        </p>
    </video>
    <!-- Load dependent scripts -->
    <script src="//imasdk.googleapis.com/js/sdkloader/ima3.js"></script>
    <script src="player.js"></script>
  </body>
</html>
```

Three imports are required to use the videojs-ima module, as seen in the player.js example below.

```javascript
import videojs from 'video.js';
import 'videojs-contrib-ads';
import 'videojs-ima';

var videoOptions = {
  controls: true,
  sources: [{
      src: 'PATH_TO_YOUR_CONTENT_VIDEO',
      type: 'YOUR_CONTENT_VIDEO_TYPE',
  }]
};

var player = videojs('content_video', videoOptions);

var imaOptions = {
  adTagUrl: 'YOUR_AD_TAG'
};

player.ima(imaOptions);
// On mobile devices, you must call initializeAdDisplayContainer as the result
// of a user action (e.g. button click). If you do not make this call, the SDK
// will make it for you, but not as the result of a user action. For more info
// see our examples, all of which are set up to work on mobile devices.
// player.ima.initializeAdDisplayContainer();
```

### Alternative Setup
If you don't use npm, you can download the source from the dist/ folder and
include it directly in your project. You'll also need to download the source for
the [videojs-contrib-ads plugin](//github.com/videojs/videojs-contrib-ads).

In your index.html file, create a new video.js player and load a (currently
empty) javascript file:

```html
<html>
  <head>
    <!-- Load dependent stylesheets. -->
    <link href="path/to/video-js.css" rel="stylesheet">
    <link rel="stylesheet" href="path/to/videojs-contrib-ads.css" />
    <link rel="stylesheet" href="path/to/videojs.ima.css" />
  </head>

  <body>
    <video id="content_video" class="video-js vjs-default-skin"
        controls preload="auto" width="YOUR_VIDEO_WIDTH" height="YOUR_VIDEO_HEIGHT">
      <source src="PATH_TO_YOUR_CONTENT_VIDEO" type="YOUR_CONTENT_VIDEO_TYPE" />
    </video>
    <!-- Load dependent scripts -->
    <script src="/path/to/video.js"></script>
    <script src="//imasdk.googleapis.com/js/sdkloader/ima3.js"></script>
    <script src="/path/to/videojs-contrib-ads.js"></script>
    <script src="/path/to/videojs.ima.js"></script>
    <script src="player.js"></script>
  </body>
</html>
```

In player.js, load the ads library and set up the IMA plugin:

```javascript
var player = videojs('content_video');

var options = {
  adTagUrl: 'YOUR_AD_TAG'
};

player.ima(options);
// On mobile devices, you must call initializeAdDisplayContainer as the result
// of a user action (e.g. button click). If you do not make this call, the SDK
// will make it for you, but not as the result of a user action. For more info
// see our examples, all of which are set up to work on mobile devices.
// player.ima.initializeAdDisplayContainer();
```

That's all there is to it!

## Playground
Check out the snippet above in-action [on CodePen](https://codepen.io/imasdk/pen/wpyQXP).

## Additional settings
The plugin accepts additional settings beyond the two required settings shown in
the previous snippet. A summary of all settings follows:


| Settings | Type | Description |
|----------|------|-------------|
| adTagUrl               | string       | A URL which returns a VAST, VMAP or ad rules,response. This will override adsResponse. |
| adsResponse            | string       | The VAST, VMAP, or ad rules response to use,in lieu of fetching one an ad tag. This is overridden if adTagUrl is set. |
| adsRequest             | object       | JSON object with ads request properties defined in the IMA SDK Docs(2). Properties set here that can also be provided elsewhere (e.g. adTagUrl) will override those other settings. |
| adLabel                | string       | Replaces the "Advertisement" text in the ad label. Added for multilingual UI support. |
| adLabelNofN            | string       | Replaces the "of" text in the ad label (e.g. ... (1 of 2) ...). Added for multilingual UI support. |
| adsRenderingSettings   | object       | JSON object with ads rendering settings as defined in the IMA SDK Docs(1). |
| autoPlayAdBreaks       | boolean      | Whether or not to automatically play VMAP or ad rules ad breaks. Defaults,to true. |
| **deprecated** adWillPlayMuted        | boolean      | Notifies the SDK whether the player intends to start ad while muted. Changing this setting will have no impact on ad playback. Defaults,to false. |
| contribAdsSettings     | object       | Additional settings to be passed to the contrib-ads plugin(3), used by,this IMA plugin. |
| debug                  | boolean      | True to load the debug version of the plugin, false to load the non-debug version.,Defaults to false. |
| disableFlashAds        | boolean      | True to disable Flash ads - Flash ads will be considered an unsupported ad type. Defaults to false. |
| disableCustomPlaybackForIOS10Plus | boolean      | Sets whether to disable custom playback on iOS 10+ browsers. If true, ads will play inline if the content video is inline. Defaults to false. |
| forceNonLinearFullSlot | boolean      | True to force non-linear AdSense ads to render as linear fullslot.,If set, the content video will be paused and the non-linear text or image ad will be rendered as,fullslot. The content video will resume once the ad has been skipped or closed. |
| id                     | string       | **DEPRECATED** as of v.1.5.0, no longer used or required. |
| locale                 | string       | Locale for ad localization. This may be any,ISO 639-1 (two-letter) or ISO 639-2,(three-letter) code(4). Defaults to 'en'. |
| nonLinearWidth         | number       | Desired width of non-linear ads. Defaults to player width. |
| nonLinearHeight        | number       | Desired height for non-linear ads. Defaults to 1/3 player height. |
| numRedirects           | number       | Maximum number of VAST redirects before the subsequent redirects will be denied,,and the ad load aborted. The number of redirects directly affects latency and thus user experience.,This applies to all VAST wrapper ads. |
| showControlsForJSAds   | boolean      | Whether or not to show the control bar for VPAID JavaScript ads. Defaults to true. |
| showCountdown          | boolean      | Whether or not to show the ad countdown timer. Defaults to true. |
| vastLoadTimeout        | number       | Override for default VAST load timeout in milliseconds for a single wrapper. The default timeout is 5000ms. |
| vpaidAllowed           | boolean      | **DEPRECATED**, please use vpaidMode. |
| vpaidMode              | VpaidMode(5) | VPAID Mode. Defaults to ENABLED. This setting,overrides vpaidAllowed. |


(1) [IMA SDK Docs](//developers.google.com/interactive-media-ads/docs/sdks/html5/v3/apis#ima.AdsRenderingSettings)
<br />
(2) [IMA SDK Docs](//developers.google.com/interactive-media-ads/docs/sdks/html5/v3/apis#ima.AdsRequest)
<br />
(3) [contrib-ads plugin](//github.com/videojs/videojs-contrib-ads)
<br />
(4) [Valid locale codes](http://www.loc.gov/standards/iso639-2/php/English_list.php)
<br />
(5) [google.ima.ImaSdkSettings.VpaidMode](//developers.google.com/interactive-media-ads/docs/sdks/html5/v3/apis#ima.ImaSdkSettings.VpaidMode)

## Disable automatic ad break playback
In some circumstances you may want to prevent the SDK from playing ad breaks
until you're ready for them. In this scenario, you can disable automatic
playback of ad breaks in favor of letting the SDK know when you're ready for an
ad break to play. To do so:

1. Set ```autoPlayAdBreaks``` to false in the initial options.
2. Provide an ad break ready listener via ```setAdBreakReadyListener```.
3. Call ```player.ima.playAdBreak()``` in your ad break ready listener when
   you're ready to play the ads.

## Where do I report issues?
Please report issues on the [issues page](../../issues).

## Terms of Service
The IMA SDK plugin for Video.js uses the IMA SDK, and as such is subject to the
[IMA SDK Terms of Service](https://developers.google.com/interactive-media-ads/terms).

## How do I contribute?
See [CONTRIBUTING.md](CONTRIBUTING.md) for details.
