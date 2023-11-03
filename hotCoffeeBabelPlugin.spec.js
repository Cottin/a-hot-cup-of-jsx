import { pluginTester } from 'babel-plugin-tester';
import hotCoffeeBabelPlugin from './hotCoffeeBabelPlugin';

// NOTE: you can use beforeAll, afterAll, beforeEach, and afterEach as usual,
// but initial configuration tasks, like loading content from fixture files,
// will complete *at the point the pluginTester function is called* which means
// BEFORE beforeAll and other Jest hooks are run.

pluginTester({
  plugin: hotCoffeeBabelPlugin,
  tests: [
    {
      code: `MyComp = function() { return _({}); }`,
      output: `var MyComp = function () {
  return _({});
};`,
    },
    {
      code: `MyComp = React.memo(function() { return _({}); })`,
      output: `var MyComp = React.memo(function () {
  return _({});
});`,
    },
    {
      code: `export default MyComp = function() { return _({}); }`,
      output: `var MyComp = function () {
  return _({});
};
export default MyComp;`,
    },
    {
      code: `export default MyComp = React.memo(function() { return _({}); })`,
      output: `var MyComp = React.memo(function () {
  return _({});
});
export default MyComp;`,
    },
  ]
});