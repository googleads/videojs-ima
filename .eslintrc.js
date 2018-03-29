module.exports = {
    'env': {
        'browser': true,
        'es6': true,
    },
    'extends': ['eslint:recommended', 'google'],
    'parserOptions': {
        'sourceType': 'module',
    },
    'rules': {
        'jsdoc/check-types': 'error',
        'space-infix-ops': 'error',
        'no-console': ['error', {
          'allow': ['warn', 'error']
        }],
    },
    'plugins': [
      'jsdoc',
    ],
};

