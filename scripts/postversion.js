const execSync = require('child_process').execSync;
const path = require('path');
const pkg = require('../package.json');
const replace = require('replace-in-file');
const rimraf = require('rimraf');

process.chdir(path.resolve(__dirname, '..'));

// Push master.
// Check out gh-pages.
// Merge master.
// npm install.
const preSedCommands = [
  'git push origin master',
  'git push --tags',
  'git checkout gh-pages',
  'git merge -X theirs master -m "Syncing gh-pages to master v' + pkg.version + '"'
];
console.log('Executing pre sed commands');
try {
  var cmdOut = execSync(preSedCommands.join(' && '));
  console.log('Executd pre sed commands', cmdOut);
} catch (error) {
  console.log('Error running pre sed commands:', error.error);
}

// Remove the node_modules directory.
console.log('Removing old node_modules.');
rimraf.sync('node_modules');
console.log('Removed old node_modules.');

// Install node modules.
console.log('Installing node_modules');
try {
  var cmdOut = execSync('npm install');
  console.log('Installed node_modules', cmdOut);
} catch (error) {
  console.log('Error running pre sed commands:', error.error);
}

// Replace examples' links to dev files with links to prod files.
const replaceOptions = {
  files: 'examples/**/*.html',
  from: [
    'videojs.ima.dev.css',
    'videojs.ima.dev.js'
  ],
  to: [
    'videojs.ima.css',
    'videojs.ima.min.js'
  ]
}
console.log('Executing sed on example files');
try {
  const changes = replace.sync(replaceOptions);
  console.log('Executd sed on example files:', changes.join(', '));
} catch (error) {
  console.error('Error with example files sed:', error);
}

// Build latest.
// Add modified files (examples, dist, and node_modules).
// Commit and push to gh-pages
// Switch back to master.
const postSedCommands = [
  'npm run rollup',
  'git add --all',
  'git add -f dist/',
  'git add -f node_modules/video.js/dist/video-js.min.css',
  'git add -f node_modules/video.js/dist/video.min.js',
  'git add -f node_modules/videojs-contrib-ads/dist/videojs.ads.css',
  'git add -f node_modules/videojs-contrib-ads/dist/videojs.ads.min.js',
  'git commit -m "Build for samples at v' + pkg.version + '"',
  'git push origin gh-pages',
  'git checkout master'
];
console.log('Executing post-sed commands');
try {
  cmdOut = execSync(postSedCommands.join(' && '));
  console.log('Executed post sed commands', cmdOut);
} catch (error) {
  console.log('Error running post sed commands:', error.error);
}