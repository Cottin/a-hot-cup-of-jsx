import { pluginTester } from 'babel-plugin-tester';
import underscoreToJSXBabelPlugin from './underscoreToJSXBabelPlugin';

// NOTE: you can use beforeAll, afterAll, beforeEach, and afterEach as usual,
// but initial configuration tasks, like loading content from fixture files,
// will complete *at the point the pluginTester function is called* which means
// BEFORE beforeAll and other Jest hooks are run.

pluginTester({
  plugin: underscoreToJSXBabelPlugin,
  tests: [
    {
     code: `_({}, 'test')`,
     output: `<div>test</div>;`,
    },
    {
     code: `_('span', {}, 'test')`,
     output: `<span>test</span>;`,
    },
    {
     code: `_(MyComp, {}, 'test')`,
     output: `<MyComp>test</MyComp>;`,
    },
    {
     code: `_('div', {p: 'ö'}, 'test')`,
     output: `<div p="ö">test</div>;`,
    },
    {
     code: `_('input', {type: 'button', value: 'Click me'})`,
     output: `<input type="button" value="Click me" />;`,
    },
    {
     code: `_({}, _('span', {}, 'test'))`,
     output: `
     <div>
       <span>test</span>
     </div>;`,
    },
    {
      code: `_({"data-month": 'time'});`,
      output: `<div data-month="time" />;`
    },
    {
      code: `_({[\`data-month-\${a}\`]: 'time'});`,
      output: `<div
  {...{
    [\`data-month-\${a}\`]: "time",
  }}
/>;`
    },
    {
     code: `_({}, props.text)`,
     output: `<div>{props.text}</div>;`,
    },
    {
     code: `_('div', props, 'test')`,
     output: `<div {...props}>test</div>;`,
    },
    {
     code: `_('div', {p: 'ö'}, 'test')`,
     output: `<div p="ö">test</div>;`,
    },
    {
     code: `_('div', props.member, 'test')`,
     output: `<div {...props.member}>test</div>;`,
    },
    {
     code: `_('input', {type: 'button', value: 'Click me', ...rest})`,
     output: `<input type="button" value="Click me" {...rest} />;`,
    },
    {
     code: `_({}, myString)`,
     output: `<div>{myString}</div>;`,
    },
    {
     code: `_({class: className}, 't6')`,
     output: `<div class={className}>t6</div>;`,
    },
    {
     code: `_(framer.motion, {class: className}, 't6')`,
     output: `<framer.motion class={className}>t6</framer.motion>;`,
    },
    {
      code: `var MyComp = function() { return _({}, _({}, 'c1'), _({}, 'c2')); }`,
      output: `
      var MyComp = function () {
        return (
          <div c="MyComp">
            <div>c1</div>
            <div>c2</div>
          </div>
        );
      };`,
    },
    {
      code: `var MyComp = function() { return _({s: 'p5'}, _({s: 'p8', class: 'box'}, 'c1'), _({}, 'c2')); }`,
      output: `
      var MyComp = function () {
        const css = useFela();
        return (
          <div c="MyComp" s="p5" class={css("p5")}>
            <div s="p8" class={css("p8") + " " + "box"}>
              c1
            </div>
            <div>c2</div>
          </div>
        );
      };`,
    },
    {
      code: `var MyComp = React.forwardRef(function() { return _({s: 'p5'})});`,
      output: `
      var MyComp = React.forwardRef(function () {
        const css = useFela();
        return <div c="MyComp" s="p5" class={css("p5")} />;
      });`,
    },
    {
     code: `_({s: s + "p4", class: base + "box"}, 't6')`,
     output: `
     <div s={s + "p4"} class={css(s + "p4") + " " + (base + "box")}>
       t6
     </div>;`,
    },
    {
     code: "_({s: `${s} xc_c _sh2 xg1`}, 'test')",
     output: `
     <div s={\`\${s} xc_c _sh2 xg1\`} class={css(\`\${s} xc_c _sh2 xg1\`)}>
       test
     </div>;`,
    },
    {
      code: `var MyComp = function() {
        return _({
          s: 'p4'
        }, [].map(function({id}) {
          return _({
            s: "p6",
            key: id
          }, 'test');
        }));
      };`,
      output: `
      var MyComp = function () {
        const css = useFela();
        return (
          <div c="MyComp" s="p4" class={css("p4")}>
            {[].map(function ({ id }) {
              return (
                <div s="p6" class={css("p6")} key={id}>
                  test
                </div>
              );
            })}
          </div>
        );
      };`,
    },
    {
      code: `var MyComp = function() {return _(Fragment, _({}, 'a'), _({}, 'b')); };`,
      output: `
      var MyComp = function () {
        return (
          <>
            <div>a</div>
            <div>b</div>
          </>
        );
      };`,
    },
    // { Use method above for now
    //   code: `_(React.Fragment, {}, _({}, 'a'), _({}, 'b'));`,
    //   output: `
    //       <>
    //         <div>a</div>
    //         <div>b</div>
    //       </>
    //   `
    // // },

    
    {
      code: `export var time = 1;`,
      output: `export const time = 1;`,
    },








//     {
//       code: `var a, k, v;
// for (k in obj) {
//   v = obj[k];
//   a = k + v;
// }`,
//       output: `var a, k, v;
// for (let k in obj) {
//   let v = obj[k];
//   a = k + v;
// }`,
//     },
//     {
//       code: `var a, k, v;
// for (k in obj) {
//   v = obj[k];
//   a = k + v;
// }`,
//       output: `var a, k, v;
// for (k in obj) {
//   v = obj[k];
//   (function (k, v) {
//     a = k + v;
//   })(k, v);
// }`,
//     },
  ]
});