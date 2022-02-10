const execSync = require('child_process').execSync;
const path = require('path');
const pkg = require('../package.json');
const rimraf = require('rimraf');

process.chdir(path.resolve(__dirname, '..'));

// Push main.
// Check out gh-pages.
// Merge main.
// npm install.
const preNpmInstallCommands = [
  'git push origin main',
  'git push --tags',
  'git branch -D gh-pages',
  'git checkout -b gh-pages origin/gh-pages',
  'git merge -X theirs main -m "Syncing gh-pages to main v' + pkg.version + '"'
];
console.log('Executing pre npm install commands');
try {
  var cmdOut = execSync(preNpmInstallCommands.join(' && '));
  console.log('Executd pre npm install commands', cmdOut);
} catch (error) {
  console.log('Error running pre npm install commands:', error.error);
}

// Remove the node_modules directory on gh-pages.
console.log('Removing old node_modules on gh-pages.');
rimraf.sync('node_modules');
console.log('Removed old node_modules on gh-pages.');

// Install node modules.
// Build latest.
// Add modified files (examples, dist, and node_modules).
// Commit and push to gh-pages
// Switch back to main.
const postNpmInstallCommands = [
  'npm install',
  'npm run rollup',
  'git add --all',
  'git add -f dist/',
  'git add -f node_modules/video.js/dist/video-js.min.css',
  'git add -f node_modules/video.js/dist/video.min.js',
  'git add -f node_modules/videojs-contrib-ads/dist/videojs.ads.css',
  'git add -f node_modules/videojs-contrib-ads/dist/videojs.ads.min.js',
  'git add -f node_modules/can-autoplay/build/can-autoplay.min.js',
  'git commit -m "Build for samples at v' + pkg.version + '"',
  'git push -f origin gh-pages',
  'git checkout main'
];
console.log('Running install and pushing new gh-pages.');
try {
  var cmdOut = execSync(postNpmInstallCommands.join(' && '));
  console.log('Ran install and pushed new gh-pages', cmdOut);
} catch (error) {
  console.log('Error runninng install and pushing new gh-pages:', error.error);
}

// Remove the node_modules directory on main.
console.log('Removing old node_modules on main.');
rimraf.sync('node_modules');
console.log('Removed old node_modules on main.');

// Install node modules.
// Build latest.
const backOnMainCommands = [
  'npm install',
  'npm run rollup'
];
console.log('Running build on main.');
try {
  var cmdOut = execSync(backOnMainCommands.join(' && '));
  console.log('Ran build on main', cmdOut);
} catch (error) {
  console.log('Error runninng build on main:', error.error);
}
