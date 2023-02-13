// Import rollup plugins
import { rollupPluginHTML as html } from "@web/rollup-plugin-html";
import copy from 'rollup-plugin-copy';
import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
import pkg from 'rollup-plugin-minify-html-literals';
const minifyHTML = pkg.default;
import summary from 'rollup-plugin-summary';
import del from 'rollup-plugin-delete'

export default {
  plugins: [
    del({ targets: 'build/**/*'}),
    // Entry point for application build; can specify a glob to build multiple
    // HTML files for non-SPA app
    html({
      input: ['index.html', 'demo.html', 'mapbox.html'],
    }),
    // Resolve bare module specifiers to relative paths
    resolve(),
    // Minify HTML template literals
    minifyHTML(),
    // Minify JS
    terser({
      ecma: 2020,
      module: true,
      warnings: true,
    }),
    // Print bundle summary
    summary(),
    // Optional: copy any static assets to build directory
    copy({
      targets: [
        {src: "images/**/*", dest: "build/images"},
        {src: "maps/**/*", dest: "build/maps"},
        {src: "styles/**/*", dest: "build/styles"},
        {src: "notosans-*woff2", dest: "build"},
        {src: "node_modules/hopscotch/dist/img/sprite-*.png", dest: "build/img"},
        {src: "images/manifest/*", dest: "build/assets/images"},
        {src: "course/**/*", dest: "build/course"},
        {src: "src/workers/buffer.js", dest: "build/src"},
        {src: "help.html", dest: "build"}
      ],
      flatten: false
    }),
  ],
  output: {
    dir: 'build',
  },
  preserveEntrySignatures: 'strict',
};