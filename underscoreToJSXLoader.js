const transformSync = require('@babel/core').transformSync
const underscoreToJSXBabelPlugin = require('./underscoreToJSXBabelPlugin.js')


module.exports = function (src, inputSourceMap) {
  const output = transformSync(src, {sourceMaps: this.sourceMap, plugins: [
    [underscoreToJSXBabelPlugin, {classAttr: 'className'}]
  ], inputSourceMap: inputSourceMap || undefined}) // inputSourceMap is null but needs to be undefined in prod

  // console.log('JSX:\n', output.code);
  // console.log('JSX:\n', output.code.replace(/\\u([\d\w]{4})/gi, (m, g) => String.fromCharCode(parseInt(g, 16))));

  this.callback(null, output.code, output.map);

  return;
}
