const exec = require('child_process').exec;
const path = require('path');
const pkg = require('../package.json');
const rimraf = require('rimraf');

process.chdir(path.resolve(__dirname, '..'));

// Remove the dist folder, then commit.
rimraf('dist', () => {
  const commands = [
    'git rm -r --cached dist',
    'git commit -m "Post-release cleanup"'
  ]

  exec(commands.join(' && '), (err, stdout, stderr) => {
    if (err) {
        process.stdout.write(err.stack);
        process.exit(err.status || 1);
      } else {
        process.stdout.write(stdout);
      }
  });
});