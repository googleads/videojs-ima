import copy from 'rollup-plugin-copy';
import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';

export default {
  name: 'videojsIma',
  input: 'src/ima-plugin.js',
  output: {
    file: 'dist/videojs.ima.js',
    format: 'umd',
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
    babel({
      exclude: 'node_modules/**',
    }),
  ],
};
