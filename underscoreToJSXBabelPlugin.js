const SyntaxJSX = require("@babel/plugin-syntax-jsx");
const t = require("@babel/types")

const propsToAttributes = (props) => {
	if (t.isObjectExpression(props)) {
		return props.properties.map((p) => {
			if (t.isObjectProperty(p)) {
				let key = null
				if (t.isIdentifier(p.key)) {
					key = t.jsxIdentifier(p.key.name)
				}
				else if (t.isStringLiteral(p.key)) {
					key = t.jsxIdentifier(p.key.value)
				}
				else if (t.isTemplateLiteral(p.key)) {
					return t.jsxSpreadAttribute(t.objectExpression([p]))
				}
				else {
					throw new Error('Not yet implemented 48')
				}

				if (t.isStringLiteral(p.value)) {
					// Note: don't wrap p.value.value in new t.stringLiteral, it turns ö into \xF6
					return t.jsxAttribute(key, p.value)
				}
				else { // Default is just to wrap the expression in { .. }
					return t.jsxAttribute(key, t.jsxExpressionContainer(p.value))
				}
				// else if (t.isIdentifier(p.value)) {
				// 	return t.jsxAttribute(key, t.jsxExpressionContainer(p.value))
				// }
				// else {
				// 	console.log(11, p.value);
				// 	throw new Error('Not yet implemented 1')
				// }
			}
			else if (t.isSpreadElement(p)) {
				return t.jsxSpreadAttribute(p.argument)
			}
			else {
				console.log(p)
				throw new Error('Not yet implemented 2')
			}
		})
	}
	else if (t.isIdentifier(props)) {
		return [t.jsxSpreadAttribute(props)]
	}
	else if (t.isMemberExpression(props)) {
		return [t.jsxSpreadAttribute(props)]
	}
	else if (!props) {
		return []
	}
	else {
		console.log(props)
		throw new Error('not yet implemented 3')
	}
}

const childrenToJSX = (children) => {
	return children.map((c) => {
		if (t.isStringLiteral(c)) {
			return t.jsxText(c.value)
		}
		else if (t.isJSXElement(c)) {
			return c
		}
		else { // default just wrap in expression container
			return jsxExp(c)
		}
	})
}

// Searches up the tree and returns
// var MyComp = React.forwardRef(function() { return _({s: 'p5'})});    	=> [MyComp, function()]
// var MyComp = function() { return _({s: 'p5'})};     										=> [MyComp, function()]
const findComponentDeclaration = (path, idx = 0, breakEarly = true) => {
	if (!path) return [null, null]
	if (t.isFunctionExpression(path.node)) {
		if (t.isVariableDeclarator(path.parentPath.node)) {
			return [path.parentPath, path]
		}
		else if (t.isCallExpression(path.parentPath.node) &&
			t.isVariableDeclarator(path.parentPath.parentPath.node)) {
			return [path.parentPath.parentPath, path]
		}
		else if (breakEarly) return [null, null]
	}
	else if (idx > 20) return [null, null]
	
	return findComponentDeclaration(path.parentPath, idx + 1)
}

const plus = (left, right) => t.BinaryExpression('+', left, right)
const str = (s) => t.stringLiteral(s)
const jsxExp = (exp) => t.jsxExpressionContainer(exp)


let counter = 0;

module.exports = ({ types: t }) => {
	return {
		name: "underscore to JSX",
		inherits: SyntaxJSX.default,
		visitor: {

			// NOTE: This experiment did not work.
			//				You'd need to redeclare all vars inside the loop to make it work and that's too complex.
			//				Workaround: stop using for .. of in coffeescript, it's too dangerous or too cumbersome to keep track
			//										of how to avoid the crazy loop errors.
			// 
			// ForInStatement: { // fixes javascript var+loop problem as described here https://github.com/jashkenas/coffeescript/issues/4015#issuecomment-203744204
			// 	exit(path, state) {
			// 		if (t.isIdentifier(path.node.left)) {
			// 			const isAlreadyReplaced = path.node.body?.body[1]?.expression?.type == 'CallExpression'
			// 			if (isAlreadyReplaced) return

			// 			const body0 = path.node.body?.body[0]
			// 			const funcBody = t.blockStatement(path.node.body.body.slice(1))
			// 			const iffe = t.expressionStatement(t.callExpression(t.functionExpression(null,
			// 				[path.node.left, body0.expression.left], funcBody), [path.node.left, body0.expression.left]))
			// 			const newBody = t.blockStatement([body0, iffe])

			// 			path.replaceWith(t.forInStatement(path.node.left, path.node.right, newBody))
			// 		}
			// 	}
			// },
			CallExpression: {
				exit(path, state) {
					const CLASS_ATTR = state.opts?.classAttr || 'class'

					if (t.isIdentifier(path.node.callee) && path.node.callee.name === '_') {
						let props, element, children = null
						const arg0 = path.node.arguments[0]

						if (t.isObjectExpression(arg0)) { // _({}, 'test')
							props = path.node.arguments[0]
							element = 'div'
							children = path.node.arguments.slice(1)
						}
						else if (t.isStringLiteral(arg0)) { // _('span', {}, 'test')
							props = path.node.arguments[1]
							element = arg0.value
							children = path.node.arguments.slice(2)
						}
						else if (t.isIdentifier(arg0)) { 
							if (arg0.name == 'Fragment') { // _(Fragment, _({}, 'test'))
								element = 'Fragment'
								props = null
								children = path.node.arguments.slice(1)
							}
							else if (arg0.name[0].toUpperCase() == arg0.name[0]) { // _(MyComp, {}, 'test')
								props = path.node.arguments[1]
								element = arg0.name
								children = path.node.arguments.slice(2)
							}
							else if (path.node.arguments.length > 2) { // _(comp, {}, 'test')
								props = path.node.arguments[1]
								element = arg0.name
								children = path.node.arguments.slice(2)
							}
							else { // _(props, 'test') or _(comp, {}) or _(comp, props)... = cannot figure out statically
								throw new Error('_ to JSX: this expression is too ambigious: ' + path.hub.getCode())
							}
						}
						else if (t.isMemberExpression(arg0)) {
							props = path.node.arguments[1]
							element = `${arg0.object.name}.${arg0.property.name}`
							children = path.node.arguments.slice(2)
						}
						else {
							console.log(arg0)
							throw new Error('not yet implemented 5')
						}

						const attributes = propsToAttributes(props)

						// Adding <div c="MyComp" ...
						if (t.isReturnStatement(path.parent)) {
							const [compDeclaration, compDeclFunction] = findComponentDeclaration(path)
							if (compDeclaration) {
								const varName = compDeclaration.node.id.name
								attributes.unshift(t.jsxAttribute(t.jsxIdentifier('c'), t.stringLiteral(varName)))
							}
							else {
								// probably a return statement for a .map or similar => do nothing
							}
						}

						// Adding <div class={css('p5')} ...
						let sIdx, classIdx
						for (const i in attributes) {
							if (attributes[i].name?.name == 's') { sIdx = i }
							else if (attributes[i].name?.name == CLASS_ATTR) { classIdx = i }
						}
						if (sIdx !== undefined) {
							let css
							if (t.isJSXExpressionContainer(attributes[sIdx].value)) {
								css = t.callExpression(t.identifier('css'), [attributes[sIdx].value.expression])
							}
							else if (t.isStringLiteral(attributes[sIdx].value)) {
								css = t.callExpression(t.identifier('css'), [attributes[sIdx].value])
							}
							else {
								console.log(attributes[sIdx])
								throw new Error("not yet implemented 142")
							}

							// add or modify class to <div class={css("p4...")} ...
							if (classIdx !== undefined) {
								if (attributes[classIdx].value.type === 'StringLiteral') {
									attributes[classIdx].value = jsxExp(plus(plus(css, str(" ")), attributes[classIdx].value))
								}
								else if (t.isJSXExpressionContainer(attributes[classIdx].value)) {
									attributes[classIdx].value.expression = plus(plus(css, str(" ")),
										attributes[classIdx].value.expression)
								}
								else {
									console.log(attributes[classIdx])
									throw new Error("not yet implemented 130")
								}
							}
							else {
								attributes.splice(sIdx+1, 0, t.jsxAttribute(t.jsxIdentifier(CLASS_ATTR),
									t.jsxExpressionContainer(css)))
							}

							// add const css = useFela() if needed
							const [compDeclaration, compDeclFunction] = findComponentDeclaration(path)
							if (compDeclaration) {
								if (t.isFunctionExpression(compDeclFunction.node) &&
									t.isBlockStatement(compDeclFunction.node.body)) {
									const body = compDeclFunction.node.body.body
									let needsUse = true;
									for (let i = 0; i < Math.min(body.length, 3); i++) {
										if (t.isVariableDeclaration(body[i]) &&
												body[i].declarations.length === 1 &&
												t.isVariableDeclarator(body[i].declarations[0]) &&
												body[i].declarations[0].id.name === 'css') {
											needsUse = false;
											break;
										}
									}
									if (needsUse) {
										const useFela = t.variableDeclaration('const', [t.variableDeclarator(t.identifier('css'),
											t.callExpression(t.identifier('useFela'), []))])
										body.unshift(useFela)
									}
								}
							}
							// else { throw new Error("not yet implemented 155") } // comment out to allow _ without function
						}


						const jsxChildren = childrenToJSX(children)

						let selfClosing, openingElement, closingElement
						if (element === 'Fragment') {
							path.replaceWith(t.jsxFragment(t.jsxOpeningFragment(), t.jsxClosingFragment(), jsxChildren))
						}
						else {
							const selfClosing = children.length === 0
							let tag = null
							if (element.includes('.')) {
								const [e0, e1] = element.split('.')
								tag = t.jsxMemberExpression(t.jsxIdentifier(e0), t.jsxIdentifier(e1))
							} else {
								tag = t.jsxIdentifier(element)
							}
							const openingElement = t.jsxOpeningElement(tag, attributes, selfClosing)
							const closingElement = selfClosing ? null : t.jsxClosingElement(tag)
							path.replaceWith(t.jsxElement(openingElement, closingElement, jsxChildren))
						}

					}
				},
			},
			ExportNamedDeclaration: {
				exit(path, state) {
					// Fixes problem of export var time = () -> 1   .... time = 2 changes the export
					if (t.isVariableDeclaration(path.node.declaration) && path.node.declaration.kind == 'var') {
						const newDeclaration = t.variableDeclaration('const', path.node.declaration.declarations)
						path.replaceWith(t.exportNamedDeclaration(newDeclaration, path.node.specifiers, path.node.source))
					}
				},
			}
		}
	}
}
