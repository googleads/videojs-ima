import copy from 'rollup-plugin-copy';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import {babel} from '@rollup/plugin-babel';

export default {
  name: 'videojsIma',
  input: 'src/ima-plugin.js',
  output: {
    file: 'dist/videojs.ima.min.js',
    format: 'umd',
    name: 'videojsIma',
  },
  external: ['video.js', 'videojs-contrib-ads'],
  globals: {
    'video.js': 'videojs',
  },
  plugins: [
    json(),
    babel({
      exclude: 'node_modules/**',
    }),
    terser(),
    copy({
      'src/css/videojs.ima.css': 'dist/videojs.ima.css',
    }),
    copy({
      'src/css/videojs.ima.css': 'dist/videojs.ima.scss',
    }),
  ],
};
