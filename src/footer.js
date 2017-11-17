/**
 * Footer JavaScript for the final distribution.
 */
  // Cross-compatibility for Video.js 5 and 6.
  var registerPlugin = videojs.registerPlugin || videojs.plugin;
  registerPlugin('ima', init);
});
