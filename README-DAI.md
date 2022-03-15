# IMA DAI implementation for the Video.js-IMA plugin

## Introduction
You can use the IMA SDK Plugin for Video.js to integrate with the Video.js
player.

If you're using the plugin for a client-side implementation, please see
the [client-side readme](//github.com/googleads/videojs-ima/blob/master/README.md)
for documentation.

To see the plugin in action for DAI, check out this
[sample](//googleads.github.io/videojs-ima/examples/dai).

## Features
Enable playback for streams integrated with ads by integrating the Google IMA
DAI SDK into Video.js. Using DAI requires an [Ad Manager 360
Advanced](//support.google.com/admanager/answer/3485387) account.

For more information, see the
[IMA DAI SDK
documentation](//developers.google.com/interactive-media-ads/docs/sdks/html5/dai).

## Requirements
  - Your favorite text editor
  - A JavaScript enabled browser
  - An [Ad Manager 360 Advanced](//support.google.com/admanager/answer/3485387)
  account.

## Get started

### ES6 Imports
The easiest way to get started is to use [npm](//www.npmjs.org/).

```
npm install videojs-ima
```

Your index.html should contain a video.js player for stream playback, and script
tags for the IMA DAI SDK and your own javascript file.

```html
<html>
  <head>
    <!-- Load any dependent stylesheets. -->
    <link href="path/to/video-js.css" rel="stylesheet">
  </head>

  <body>
    <video id='video_player' class="video-js">
        <p class='vjs-no-js'>
            To view this video, please enable JavaScript and consider upgrading
          to a web browser that
            <a href='https://videojs.com/html5-video-support/' target='_blank'>
              supports HTML5 video
          </a>
        </p>
    </video>
    <!-- Load dependent scripts -->
    <script src="//imasdk.googleapis.com/js/sdkloader/ima3_dai.js"></script>
    <script src="player.js"></script>
  </body>
</html>
```

The following imports are required to use the videojs-ima module, as seen in the
player.js example below. Note that both the `VodStream` and `LiveStream` class
are imported, but most likely only one will be used at a time.

```javascript
import videojs from 'video.js';
import 'videojs-contrib-hls';
import 'videojs-contrib-ads';
import {VodStream, LiveStream} from 'videojs-ima';

const videoOptions = {
  controls: true,
  // Include other video.js options as needed.
};

const player = videojs('video_player', videoOptions);

// Example of a Live and VOD stream using IMA's samples streams.
const vodStream = new VodStream('hls', '2528370', 'tears-of-steel');
const liveStream = new LiveStream('hls', 'sN_IYUG8STe1ZzhIIE_ksA');

const imaOptions = {
  fallbackStreamUrl: 'http://storage.googleapis.com/testtopbox-public/video_content/bbb/master.m3u8',
  // Include other IMA DAI options as needed.
};

player.imaDai(vodStream, imaOptions);
```

### Alternative Setup
If you don't use npm, you can download the source from the `dist/` folder and
include it directly in your project. You'll also need to download the source for
the [videojs-contrib-ads plugin](//github.com/videojs/videojs-contrib-ads) and
the [videojs-http-streaming plugin](//github.com/videojs/http-streaming).

In your index.html file, create a new video.js player and load a (currently
empty) javascript file:

```html
<html>
  <head>
    <!-- Load dependent stylesheets. -->
    <link href="path/to/video-js.css" rel="stylesheet">
    <link rel="stylesheet" href="path/to/videojs-contrib-ads.css" />
  </head>

  <body>
    <video id='video_player' class="video-js">
        <p class='vjs-no-js'>
            To view this video, please enable JavaScript and consider upgrading
            to a web browser that
            <a href='https://videojs.com/html5-video-support/' target='_blank'>
                supports HTML5 video
            </a>
        </p>
    </video>
    <!-- Load dependent scripts -->
    <script src="/path/to/video.js"></script>
    <script src="//imasdk.googleapis.com/js/sdkloader/ima3_dai.js"></script>
    <script src="/path/to/videojs-contrib-ads.js"></script>
    <script src="/path/to/videojs-http-streaming.min.js"></script>
    <script src="/path/to/videojs.ima.js"></script>
    <script src="player.js"></script>
  </body>
</html>
```

In player.js, load the ads library and set up the IMA plugin:

```javascript
import videojs from 'video.js';
import {VodStream, LiveStream} from 'videojs-ima';

const videoOptions = {
  controls: true,
  // Include other video.js options as needed.
};

const player = videojs('video_player', videoOptions);

// Example of a Live and VOD stream using IMA's samples streams.
const vodStream = new VodStream('hls', '2528370', 'tears-of-steel');
const liveStream = new LiveStream('hls', 'sN_IYUG8STe1ZzhIIE_ksA');

const imaOptions = {
  fallbackStreamUrl: 'http://storage.googleapis.com/testtopbox-public/video_content/bbb/master.m3u8',
  // Include other IMA DAI options as needed.
};

player.imaDai(vodStream, imaOptions);
```

## Stream constructors
The following options are required by the following class constructors:

### LiveStream(streamFormat, assetKey)

| Settings | Type | Description |
|----------|------|-------------|
| streamFormat | string | 'hls' or 'dash'. |
| assetKey | string | The live stream's asset key. |

### VodStream(streamFormat, cmsId, videoId)

| Settings | Type | Description |
|----------|------|-------------|
| streamFormat | string | 'hls' or 'dash'. |
| cmsId | string | The VOD stream's CSM ID. |
| videoId | string | The VOD stream's video ID |

## Additional settings
The DAI portion of the plugin accepts a number of settings for stream playback.
A summary of all settings follows:

| Settings | Type | Description |
|----------|------|-------------|
| apiKey | string | The API key. |
| authKey | string | The stream request authorization token. |
| bookmarkTime | number | The content time in seconds where the user previously left off. |
| locale | string | Supported country codes for localization. The supported locale codes can be found in [Localizing for Language and Locale](//developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/localization) |
| adTagParameters | object | This object will be set as `streamRequest.adTagParameters` on stream requests. |
| fallbackStreamUrl | string | The backup stream to be played if stream request fails. |
| streamActivityMonitorId | string | Monitoring ID used only for debugging. |

## IMA DAI Plugin Ad Events
The IMA DAI Plugin will fire an event for the StreamRequest that can be listened to. Please see the below
example to set up this listener.

```javascript
player = videojs('video_player');

player.on('stream-request', function(response){
  const streamRequest = response.StreamRequest;
  // Your code in response to the `stream-request` event.
})
```

## Where do I report issues?
Please report issues on the [issues page](../../issues).

## Terms of Service
The IMA SDK plugin for Video.js uses the IMA SDK, and as such is subject to the
[IMA SDK Terms of Service](//developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/terms).

## How do I contribute?
See [CONTRIBUTING.md](CONTRIBUTING.md) for details.
