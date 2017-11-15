const sourceFiles = [
  'src/header.js',
  'src/util.js',
  'src/sdk-impl.js',
  'src/ad-ui.js',
  'src/player-wrapper.js',
  'src/controller.js',
  'src/ima-plugin.js',
  'src/footer.js'
];
const outFile = 'dist/videojs.ima.js'

const concat = require('concat');
concat(sourceFiles, outFile)
