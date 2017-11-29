const exec = require('child_process').exec;

// Roll HEAD back one commit to get rid of the tagged commit with
// dist/ in the master history.
exec('git reset --hard HEAD~1', (err, stdout, stderr) => {
    if (err) {
      process.stdout.write(err.stack);
      process.exit(err.status || 1);
    } else {
      process.stdout.write(stdout);
    }
});