<!-- GENERATED FROM SOURCE -->

# player.ima


---

## INDEX

- [METHODS](#methods)
  - [addContentEndedListener](#addcontentendedlistener-listener-)
  - [addEventListener](#addeventlistener-event-callback-)
  - [getAdsManager](#getadsmanager)
  - [initializeAdDisplayContainer](#initializeaddisplaycontainer)
  - [pauseAd](#pausead)
  - [requestAds](#requestads)
  - [resumeAd](#resumead)
  - [setShowCountdown](#setshowcountdown-showcountdownin-)
  - [start](#start)
  - [updateCurrentTime](#updatecurrenttime)

---

## METHODS

### addContentEndedListener( listener )
> Adds a listener for the 'ended' event of the video player. This should be
> used instead of setting an 'ended' listener directly to ensure that the
> ima can do proper cleanup of the SDK before other event listeners
> are called.

##### PARAMETERS: 
* __listener__ `function` The listener to be called when content completes.

_defined in_: [src/videojs.ima.js#L634](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L634)

---

### addEventListener( event, callback )
> Ads an EventListener to the AdsManager. For a list of available events,
> see
> https://developers.google.com/interactive-media-ads/docs/sdks/html5/v3/apis#ima.AdEvent.Type

##### PARAMETERS: 
* __event__ `google.ima.AdEvent.Type` The AdEvent.Type for which to listen.
* __callback__ `function` The method to call when the event is fired.

_defined in_: [src/videojs.ima.js#L584](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L584)

---

### getAdsManager()
> Returns the instance of the AdsManager.

##### RETURNS: 
* `google.ima.AdsManager` The AdsManager being used by the plugin.

_defined in_: [src/videojs.ima.js#L594](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L594)

---

### initializeAdDisplayContainer()
> Initializes the AdDisplayContainer. On mobile, this must be done as a
> result of user action.

_defined in_: [src/videojs.ima.js#L145](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L145)

---

### pauseAd()
> Pauses the ad.

_defined in_: [src/videojs.ima.js#L641](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L641)

---

### requestAds()
> Creates the AdsRequest and request ads through the AdsLoader.

_defined in_: [src/videojs.ima.js#L153](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L153)

---

### resumeAd()
> Resumes the ad.

_defined in_: [src/videojs.ima.js#L652](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L652)

---

### setShowCountdown( showCountdownIn )
> Changes the flag to show or hide the ad countdown timer.

##### PARAMETERS: 
* __showCountdownIn__ `boolean` Show or hide the countdown timer.

_defined in_: [src/videojs.ima.js#L706](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L706)

---

### start()
> Start ad playback, or content video playback in the absence of a
> pre-roll.

_defined in_: [src/videojs.ima.js#L213](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L213)

---

### updateCurrentTime()
> Updates the current time of the video

_defined in_: [src/videojs.ima.js#L674](https://github.com/googleads/videojs-ima/blob/mastersrc/videojs.ima.js#L674)

---

