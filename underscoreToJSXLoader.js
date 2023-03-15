const transformSync = require('@babel/core').transformSync
const underscoreToJSXBabelPlugin = require('./underscoreToJSXBabelPlugin.js')


module.exports = function (src, inputSourceMap) {
  const output = transformSync(src, {sourceMaps: this.sourceMap, plugins: [
    underscoreToJSXBabelPlugin
  ], inputSourceMap})

  this.callback(null, output.code, output.map);

  return;
}
