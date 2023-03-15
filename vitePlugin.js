
const transformSync = require('@babel/core').transformSync

const CoffeeScript = require('coffeescript')
const underscoreToJSXbabelPlugin = require('./underscoreToJSXBabelPlugin.js')
const hotCoffeeBabelPlugin = require('./hotCoffeeBabelPlugin.js')

const coffeePlugin = () => {
  return {
    name: 'coffee',
    enforce: 'pre',
    transform: (src, id) => {
      if (/\.coffee$/.test(id)) {
        const {js, sourceMap} = CoffeeScript.compile(src, {sourceMap: true})
        // console.log('js', js)

        return {code: js, map: sourceMap}
      }
    }
  }
}

const hotCoffeePlugin = () => {
  return {
    name: 'hotCoffeePlugin',
    enforce: 'pre',
    transform: (src, id) => {
      if (/\.coffee$/.test(id)) {
        const output = transformSync(src, {plugins: [
          hotCoffeeBabelPlugin
        ]})
        // console.log('hot', output.code)
        return {
          code: output.code,
          map: output.map
        };
      }
    }
  };
};

const _toJSXPlugin = () => {
  return {
    name: '_toJSXPlugin',
    enforce: 'pre',
    transform: (src, id) => {
      if (/\.coffee$/.test(id)) {
        const output = transformSync(src, {plugins: [
          underscoreToJSXbabelPlugin
        ]})
        // console.log('_toJSX', output.code);
        return {
          code: output.code,
          map: output.map
        };
      }
    }
  };
};


module.exports = {coffeePlugin, hotCoffeePlugin, _toJSXPlugin}