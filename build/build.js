const sourceFiles = [
  'src/videojs.ima.js',
  'src/videojs.ima.js.2'
];
const outFile = 'dist/videojs.ima.js'

const concat = require('concat');
concat(sourceFiles, outFile)
