const transformSync = require('@babel/core').transformSync
const hotCoffeeBabelPlugin = require('./hotCoffeeBabelPlugin')


module.exports = function (src, inputSourceMap) {
  const output = transformSync(src, {sourceMaps: this.sourceMap, plugins: [
    hotCoffeeBabelPlugin
  ], inputSourceMap})

  // console.log('output.code', output.code);

  this.callback(null, output.code, output.map);
  
  return;
}
