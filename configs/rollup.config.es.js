import copy from 'rollup-plugin-copy';
import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';

export default {
  name: 'videojsIma',
  input: 'src/ima-plugin.js',
  output: {
    file: 'dist/videojs.ima.es.js',
    format: 'es',
  },
  external: ['video.js', 'videojs-contrib-ads'],
  globals: {
    'video.js': 'videojs',
  },
  plugins: [
    json(),
    copy({
      'src/css/videojs.ima.css': 'dist/videojs.ima.css',
    }),
    copy({
      'src/css/videojs.ima.css': 'dist/videojs.ima.scss',
    }),
    babel({
      exclude: 'node_modules/**',
    }),
  ],
};
