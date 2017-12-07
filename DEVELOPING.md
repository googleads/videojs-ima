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

## Releasing
Releases should only be created by the repository owners. If you think we're in
need of a new release, please open an issue in our [issue
tracker](https://github.com/googleads/videojs-ima/issues).

To create a new release, run the following:

```
npm version [major|minor|patch]
npm publish
```
