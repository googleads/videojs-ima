# Developing

## Running the dev server
The videojs-ima plugin includes a continuous build dev server you can use to
manually test changes as you make them. To start developing, run the following:

```
npm install
npm run devServer
```

and open http://localhost:8080 in your browser. This will take you to our list
of samples. When you save source files, the development server will re-compile
the JavaScript and you can refresh the page to see your changes.

## Submitting code
For information on submitting your changes, please take a look at
[CONTRIBUTING.md](https://github.com/googleads/videojs-ima/blob/master/CONTRIBUTING.md).

## Testing
Testing can be done by running the following:
```
npm test
```
If you're a member of our BrowserStack group and want to run tests on
BrowserStack, you must:
- Set your BROWSERSTACK_USER and BROWSERSTACK_ACCESS_KEY environment variables.
These values are available under "Automate" on the
[BrowserStack account settings page](https://www.browserstack.com/accounts/settings).
- Set the BROWSERSTACK_LOCAL_IDENTIFIER environment variable to a string of your
choice.
- Download the
[BrowserStackLocal binary](https://www.browserstack.com/automate/node) and run
`./BrowserStackLocal --key $BROWSERSTACK_ACCESS_KEY --local-identifier $BROWSERSTACK_LOCAL_IDENTIFIER`.

The BrowserStack tests will be skipped if the environment variables listed above are not set.

## Releasing
Releases should only be created by the repository owners. If you're not an owner
and think we're in need of a new release, please open an issue in our
[issue tracker](https://github.com/googleads/videojs-ima/issues).

To create a new release, run the following:

```
npm version [major|minor|patch]
npm publish
```
