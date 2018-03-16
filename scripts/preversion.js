const execSync = require('child_process').execSync;
const rimraf = require('rimraf');

// Remove the node_modules directory on master and re-install.
console.log('Removing old node_modules on gh-pages.');
rimraf.sync('node_modules');
console.log('Removed old node_modules on gh-pages.');
console.log('Running install.');
try {
  var cmdOut = execSync('npm install');
  console.log('Ran install.', cmdOut);
} catch (error) {
  console.log('Error runninng install:', error.error);
}

if (process.env.BROWSERSTACK_USER === undefined ||
    process.env.BROWSERSTACK_ACCESS_KEY === undefined) {
  console.error(
      'ERROR: Both BROWSERSTACK_USER and BROWSERSTACK_ACCESS_KEY must be set');
  process.exit(1);
}
