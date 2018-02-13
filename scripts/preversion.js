if (process.env.BROWSERSTACK_USER === undefined ||
    process.env.BROWSERSTACK_ACCESS_KEY === undefined) {
  process.exit(1);
}
