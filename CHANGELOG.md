<a name="1.2.1"></a>
## [1.2.1](https://github.com/googleads/videojs-ima/compare/v1.2.0...v1.2.1) (2018-03-06)

### Bug Fixes

* Fix setAdBreakReadyListener. ([#551](https://github.com/googleads/videojs-ima/issues/551)) ([a835fd8](https://github.com/googleads/videojs-ima/commit/a835fd8)), closes [#550](https://github.com/googleads/videojs-ima/issues/550)

### Tests

* Test against both video.js 5 and 6. ([#548](https://github.com/googleads/videojs-ima/issues/548)) ([60dabe5](https://github.com/googleads/videojs-ima/commit/60dabe5))

<a name="1.2.0"></a>
# [1.2.0](https://github.com/googleads/videojs-ima/compare/v1.1.1...v1.2.0) (2018-03-01)

### Features

* Add support for contrib-ads 6 and by extension VJS 6. ([#538](https://github.com/googleads/videojs-ima/issues/538)) ([d8edd05](https://github.com/googleads/videojs-ima/commit/d8edd05))

### Bug Fixes

* Fix undefined isMobile in sdk-impl. Fixes [#541](https://github.com/googleads/videojs-ima/issues/541) ([#542](https://github.com/googleads/videojs-ima/issues/542)) ([e7dd9c8](https://github.com/googleads/videojs-ima/commit/e7dd9c8))

### Documentation

* Move README badges to the top. It's what everyone else does. ([#540](https://github.com/googleads/videojs-ima/issues/540)) ([23d01fb](https://github.com/googleads/videojs-ima/commit/23d01fb))

<a name="1.1.1"></a>
## [1.1.1](https://github.com/googleads/videojs-ima/compare/v1.1.0...v1.1.1) (2018-02-27)

### Bug Fixes

* Fix redundant calculation of remainingTime for ad UI. ([#527](https://github.com/googleads/videojs-ima/issues/527)) ([d8d70a4](https://github.com/googleads/videojs-ima/commit/d8d70a4)), closes [#526](https://github.com/googleads/videojs-ima/issues/526)

### Tests

* removed pull request check ([#522](https://github.com/googleads/videojs-ima/issues/522)) ([e9b5490](https://github.com/googleads/videojs-ima/commit/e9b5490))

<a name="1.1.0"></a>
# [1.1.0](https://github.com/googleads/videojs-ima/compare/v1.0.3...v1.1.0) (2018-02-14)

### Features

* Add support for full slot ads by changing the default non-linear ad slot height from 1/3 player height to 100% player height. ([#501](https://github.com/googleads/videojs-ima/issues/501)) ([9532a7f](https://github.com/googleads/videojs-ima/commit/9532a7f))
* Auto-populate setAdWillPlayMuted if not provided in settings. ([b313873](https://github.com/googleads/videojs-ima/commit/b313873))
* Use font relative units in CSS instead of pixels. ([#503](https://github.com/googleads/videojs-ima/issues/503)) ([aff9e5e](https://github.com/googleads/videojs-ima/commit/aff9e5e)), closes [#492](https://github.com/googleads/videojs-ima/issues/492)

### Bug Fixes

* Actually use adWillPlayMuted variable I created. ([#520](https://github.com/googleads/videojs-ima/issues/520)) ([f2837c4](https://github.com/googleads/videojs-ima/commit/f2837c4))
* Fix preversion script. ([#516](https://github.com/googleads/videojs-ima/issues/516)) ([c370e72](https://github.com/googleads/videojs-ima/commit/c370e72))

### Documentation

* Add keywords to package.json. This should list us on the videoj… ([#486](https://github.com/googleads/videojs-ima/issues/486)) ([7af46cf](https://github.com/googleads/videojs-ima/commit/7af46cf))
* Update README with new snippet and codepen link. ([#483](https://github.com/googleads/videojs-ima/issues/483)) ([2d40f74](https://github.com/googleads/videojs-ima/commit/2d40f74))

### Tests

* **webdriver:** Adds browserstack config (local only). ([#510](https://github.com/googleads/videojs-ima/issues/510)) ([d7d7939](https://github.com/googleads/videojs-ima/commit/d7d7939))
* Added Travis CI credentials for browserstack. ([#511](https://github.com/googleads/videojs-ima/issues/511)) ([6b6f124](https://github.com/googleads/videojs-ima/commit/6b6f124))
* Fix error with BrowserStack tests. ([#519](https://github.com/googleads/videojs-ima/issues/519)) ([e4722d0](https://github.com/googleads/videojs-ima/commit/e4722d0))

<a name="1.0.3"></a>
## [1.0.3](https://github.com/googleads/videojs-ima/compare/v1.0.2...v1.0.3) (2018-01-03)

<a name="1.0.2"></a>
## [1.0.2](https://github.com/googleads/videojs-ima/compare/v1.0.1...v1.0.2) (2018-01-03)

### Bug Fixes

* Added babel to build for ES2015, so older browsers are supported ([#478](https://github.com/googleads/videojs-ima/issues/478)) ([9b25179](https://github.com/googleads/videojs-ima/commit/9b25179))
* Fix advanced sample for mobile. ([#469](https://github.com/googleads/videojs-ima/issues/469)) ([c0c4bee](https://github.com/googleads/videojs-ima/commit/c0c4bee))

### Documentation

* Add commit message guidelines to CONTRIBUTING.md. ([#480](https://github.com/googleads/videojs-ima/issues/480)) ([f6a982a](https://github.com/googleads/videojs-ima/commit/f6a982a))

### Tests

* Added basic webdriver tests ([#464](https://github.com/googleads/videojs-ima/issues/464)) ([8786de9](https://github.com/googleads/videojs-ima/commit/8786de9))

<a name="1.0.1"></a>
## [1.0.1](https://github.com/googleads/videojs-ima/compare/v1.0.0...v1.0.1) (2017-12-13)

### Bug Fixes

* Add src to package.json ([#461](https://github.com/googleads/videojs-ima/issues/461)) ([8a94908](https://github.com/googleads/videojs-ima/commit/8a94908))
* Fixed player version reporting. ([#459](https://github.com/googleads/videojs-ima/issues/459)) ([c176781](https://github.com/googleads/videojs-ima/commit/c176781))

<a name="1.0.0"></a>
# [1.0.0](https://github.com/googleads/videojs-ima/compare/0.8.0...v1.0.0) (2017-12-12)

### Code Refactoring

* Massive refactor of the plugin. ([a5cd819](https://github.com/googleads/videojs-ima/commit/a5cd819))

<a name="0.8.0"></a>
# [0.8.0](https://github.com/googleads/videojs-ima/compare/0.6.0...0.8.0) (2017-11-16)

<a name="0.5.0"></a>
# [0.5.0](https://github.com/googleads/videojs-ima/compare/0.4.0...0.5.0) (2016-09-20)

