const concat = require('concat');
const fs = require('file-system');

const sourceFiles = [
  'src/header.js',
  'src/sdk-impl.js',
  'src/ad-ui.js',
  'src/player-wrapper.js',
  'src/controller.js',
  'src/ima-plugin.js',
  'src/footer.js'
];
const outFile = 'dist/videojs.ima.js'
concat(sourceFiles, outFile)

fs.copyFile('src/css/videojs.ima.css', 'dist/videojs.ima.css');
