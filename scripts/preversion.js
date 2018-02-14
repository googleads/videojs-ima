if (process.env.BROWSERSTACK_USER === undefined ||
    process.env.BROWSERSTACK_ACCESS_KEY === undefined) {
  console.error(
      'ERROR: Both BROWSERSTACK_USER and BROWSERSTACK_ACCESS_KEY must be set');
  process.exit(1);
}
