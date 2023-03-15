import { transformSync } from '@babel/core';
import SyntaxJSX from "@babel/plugin-syntax-jsx";
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import CoffeeScript from 'coffeescript';

import { coffeePlugin, hotCoffeePlugin, _toJSXPlugin } from '../vitePlugin'


export default defineConfig({
  plugins: [
  	coffeePlugin(),
    hotCoffeePlugin(),
    // logPlugin(),
   	_toJSXPlugin({}),
  	solidPlugin({
  		extensions: ['.coffee'],
  	}),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
  resolve: {
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.coffee']
  },
});
