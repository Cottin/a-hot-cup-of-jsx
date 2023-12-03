const SyntaxJSX = require("@babel/plugin-syntax-jsx");

// SolidBabelPlugin (or Babel itself?) seems to add hot reload stuff like so:

// const _Hot$$App = function App() {
//   return _tmpl$.cloneNode(true);
// };
// $$registrations._Hot$$App = {
//   component: _Hot$$App,
//   id: "_Hot$$App"
// };

// It seems to look for the pattern function App() {... or var App = function() { ...
// But coffeescript transpiles to
// var App;
// App = function() { ...

// One easy solution seems to be to add the var back again infront of App, and this plugin does that.

// Next.js does similar things too make hot reloading work and this plugin fixes works with next.js too.

module.exports = ({ types: t }) => {

	return {
		name: "Hot coffee",
		inherits: SyntaxJSX.default,
		visitor: {
			// App = function() { ...  -> var App = function() { ...
			ExpressionStatement: {
				enter(path, state) {
					const expression = path.node.expression

					if (t.isAssignmentExpression(expression) &&
						t.isIdentifier(expression.left) &&
						expression.left.name[0].toUpperCase() === expression.left.name[0]){

						const rightIsFunc = t.isFunctionExpression(expression.right) // App = function()
						const rightIsWrappedFunc = t.isCallExpression(expression.right) && // App = memo(function() ...)
																				t.isFunctionExpression(expression.right.arguments[0])
						
						if (rightIsFunc || rightIsWrappedFunc) {
							path.replaceWith(t.variableDeclaration('var', [
								t.variableDeclarator(expression.left, expression.right)
							]))
						}
					}
				}
			},


			// export default App = function() { ...   ->  	var App = function() { ...
			// 																							export default App;jk
			ExportDefaultDeclaration: {
				enter(path, state) {
					const declaration = path.node.declaration

					if (t.isAssignmentExpression(declaration) &&
						t.isIdentifier(declaration.left) &&
						declaration.left.name[0].toUpperCase() === declaration.left.name[0]) {

						const rightIsFunc = t.isFunctionExpression(declaration.right) // App = function()
						const rightIsWrappedFunc = t.isCallExpression(declaration.right) && // App = memo(function() ...)
																				t.isFunctionExpression(declaration.right.arguments[0])

						if (rightIsFunc || rightIsWrappedFunc) {
							path.replaceWithMultiple([
								t.variableDeclaration('var', [t.variableDeclarator(declaration.left, declaration.right)]),
								t.exportDefaultDeclaration(declaration.left)
							])
						}
					}
				}
			},

			// export App = function() is compiled to export var App = .. in CoffeeScript so no need to intervene
		}
	}
}
