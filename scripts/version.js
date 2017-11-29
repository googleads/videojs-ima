const exec = require('child_process').exec;
const path = require('path');
const pkg = require('../package.json');

process.chdir(path.resolve(__dirname, '..'));

const commands = [
  'conventional-changelog -p videojs -i CHANGELOG.md -s -r 0',
  'git add CHANGELOG.md',
  'git add package.json',
  `git commit -m "${pkg.version}"`,
  'npm run rollup',
  'git add -f dist'
]

exec(commands.join(' && '), (err, stdout, stderr) => {
  if (err) {
      process.stdout.write(err.stack);
      process.exit(err.status || 1);
    } else {
      process.stdout.write(stdout);
    }
});