const concat = require('concat');
const fs = require('file-system');
const uglify = require('uglify-js');

const sourceFiles = [
  'build/header.js',
  'src/sdk-impl.js',
  'src/ad-ui.js',
  'src/player-wrapper.js',
  'src/controller.js',
  'src/ima-plugin.js',
  'build/footer.js'
];
const outFile = 'dist/videojs.ima.max.js'
concat(sourceFiles).then(concatCode => {
  const uglifiedCode = uglify.minify(concatCode);
  fs.writeFile('dist/videojs.ima.js', uglifiedCode.code);
  fs.writeFile('dist/videojs.ima.max.js', concatCode);
});

fs.copyFile('src/css/videojs.ima.css', 'dist/videojs.ima.css');
