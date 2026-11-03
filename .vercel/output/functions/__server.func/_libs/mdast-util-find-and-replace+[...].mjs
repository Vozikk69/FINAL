import { t as escapeStringRegexp } from "./escape-string-regexp.mjs";
//#region node_modules/unist-util-is/lib/index.js
/**
* Generate an assertion from a test.
*
* Useful if you’re going to test many nodes, for example when creating a
* utility where something else passes a compatible test.
*
* The created function is a bit faster because it expects valid input only:
* a `node`, `index`, and `parent`.
*
* @param {Test} test
*   *   when nullish, checks if `node` is a `Node`.
*   *   when `string`, works like passing `(node) => node.type === test`.
*   *   when `function` checks if function passed the node is true.
*   *   when `object`, checks that all keys in test are in node, and that they have (strictly) equal values.
*   *   when `array`, checks if any one of the subtests pass.
* @returns {Check}
*   An assertion.
*/
var convert = (
/**
* @param {Test} [test]
* @returns {Check}
*/
function(test) {
	if (test === null || test === void 0) return ok;
	if (typeof test === "function") return castFactory(test);
	if (typeof test === "object") return Array.isArray(test) ? anyFactory(test) : propertiesFactory(test);
	if (typeof test === "string") return typeFactory(test);
	throw new Error("Expected function, string, or object as test");
});
/**
* @param {Array<Props | TestFunction | string>} tests
* @returns {Check}
*/
function anyFactory(tests) {
	/** @type {Array<Check>} */
	const checks = [];
	let index = -1;
	while (++index < tests.length) checks[index] = convert(tests[index]);
	return castFactory(any);
	/**
	* @this {unknown}
	* @type {TestFunction}
	*/
	function any(...parameters) {
		let index = -1;
		while (++index < checks.length) if (checks[index].apply(this, parameters)) return true;
		return false;
	}
}
/**
* Turn an object into a test for a node with a certain fields.
*
* @param {Props} check
* @returns {Check}
*/
function propertiesFactory(check) {
	const checkAsRecord = check;
	return castFactory(all);
	/**
	* @param {Node} node
	* @returns {boolean}
	*/
	function all(node) {
		const nodeAsRecord = node;
		/** @type {string} */
		let key;
		for (key in check) if (nodeAsRecord[key] !== checkAsRecord[key]) return false;
		return true;
	}
}
/**
* Turn a string into a test for a node with a certain type.
*
* @param {string} check
* @returns {Check}
*/
function typeFactory(check) {
	return castFactory(type);
	/**
	* @param {Node} node
	*/
	function type(node) {
		return node && node.type === check;
	}
}
/**
* Turn a custom test into a test for a node that passes that test.
*
* @param {TestFunction} testFunction
* @returns {Check}
*/
function castFactory(testFunction) {
	return check;
	/**
	* @this {unknown}
	* @type {Check}
	*/
	function check(value, index, parent) {
		return Boolean(looksLikeANode(value) && testFunction.call(this, value, typeof index === "number" ? index : void 0, parent || void 0));
	}
}
function ok() {
	return true;
}
/**
* @param {unknown} value
* @returns {value is Node}
*/
function looksLikeANode(value) {
	return value !== null && typeof value === "object" && "type" in value;
}
//#endregion
//#region node_modules/unist-util-visit-parents/lib/color.node.js
/**
* Color a string.
*
* @param {string} d
*   Value.
* @returns {string}
*   Colored value.
*/
function color(d) {
	return "\x1B[33m" + d + "\x1B[39m";
}
//#endregion
//#region node_modules/unist-util-visit-parents/lib/index.js
/**
* @import {Node as UnistNode, Parent as UnistParent} from 'unist'
*/
/**
* @typedef {Exclude<import('unist-util-is').Test, undefined> | undefined} Test
*   Test from `unist-util-is`.
*
*   Note: we have remove and add `undefined`, because otherwise when generating
*   automatic `.d.ts` files, TS tries to flatten paths from a local perspective,
*   which doesn’t work when publishing on npm.
*/
/**
* @typedef {(
*   Fn extends (value: any) => value is infer Thing
*   ? Thing
*   : Fallback
* )} Predicate
*   Get the value of a type guard `Fn`.
* @template Fn
*   Value; typically function that is a type guard (such as `(x): x is Y`).
* @template Fallback
*   Value to yield if `Fn` is not a type guard.
*/
/**
* @typedef {(
*   Check extends null | undefined // No test.
*   ? Value
*   : Value extends {type: Check} // String (type) test.
*   ? Value
*   : Value extends Check // Partial test.
*   ? Value
*   : Check extends Function // Function test.
*   ? Predicate<Check, Value> extends Value
*     ? Predicate<Check, Value>
*     : never
*   : never // Some other test?
* )} MatchesOne
*   Check whether a node matches a primitive check in the type system.
* @template Value
*   Value; typically unist `Node`.
* @template Check
*   Value; typically `unist-util-is`-compatible test, but not arrays.
*/
/**
* @typedef {(
*   Check extends ReadonlyArray<infer T>
*   ? MatchesOne<Value, T>
*   : Check extends Array<infer T>
*   ? MatchesOne<Value, T>
*   : MatchesOne<Value, Check>
* )} Matches
*   Check whether a node matches a check in the type system.
* @template Value
*   Value; typically unist `Node`.
* @template Check
*   Value; typically `unist-util-is`-compatible test.
*/
/**
* @typedef {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10} Uint
*   Number; capped reasonably.
*/
/**
* @typedef {I extends 0 ? 1 : I extends 1 ? 2 : I extends 2 ? 3 : I extends 3 ? 4 : I extends 4 ? 5 : I extends 5 ? 6 : I extends 6 ? 7 : I extends 7 ? 8 : I extends 8 ? 9 : 10} Increment
*   Increment a number in the type system.
* @template {Uint} [I=0]
*   Index.
*/
/**
* @typedef {(
*   Node extends UnistParent
*   ? Node extends {children: Array<infer Children>}
*     ? Child extends Children ? Node : never
*     : never
*   : never
* )} InternalParent
*   Collect nodes that can be parents of `Child`.
* @template {UnistNode} Node
*   All node types in a tree.
* @template {UnistNode} Child
*   Node to search for.
*/
/**
* @typedef {InternalParent<InclusiveDescendant<Tree>, Child>} Parent
*   Collect nodes in `Tree` that can be parents of `Child`.
* @template {UnistNode} Tree
*   All node types in a tree.
* @template {UnistNode} Child
*   Node to search for.
*/
/**
* @typedef {(
*   Depth extends Max
*   ? never
*   :
*     | InternalParent<Node, Child>
*     | InternalAncestor<Node, InternalParent<Node, Child>, Max, Increment<Depth>>
* )} InternalAncestor
*   Collect nodes in `Tree` that can be ancestors of `Child`.
* @template {UnistNode} Node
*   All node types in a tree.
* @template {UnistNode} Child
*   Node to search for.
* @template {Uint} [Max=10]
*   Max; searches up to this depth.
* @template {Uint} [Depth=0]
*   Current depth.
*/
/**
* @typedef {InternalAncestor<InclusiveDescendant<Tree>, Child>} Ancestor
*   Collect nodes in `Tree` that can be ancestors of `Child`.
* @template {UnistNode} Tree
*   All node types in a tree.
* @template {UnistNode} Child
*   Node to search for.
*/
/**
* @typedef {(
*   Tree extends UnistParent
*     ? Depth extends Max
*       ? Tree
*       : Tree | InclusiveDescendant<Tree['children'][number], Max, Increment<Depth>>
*     : Tree
* )} InclusiveDescendant
*   Collect all (inclusive) descendants of `Tree`.
*
*   > 👉 **Note**: for performance reasons, this seems to be the fastest way to
*   > recurse without actually running into an infinite loop, which the
*   > previous version did.
*   >
*   > Practically, a max of `2` is typically enough assuming a `Root` is
*   > passed, but it doesn’t improve performance.
*   > It gets higher with `List > ListItem > Table > TableRow > TableCell`.
*   > Using up to `10` doesn’t hurt or help either.
* @template {UnistNode} Tree
*   Tree type.
* @template {Uint} [Max=10]
*   Max; searches up to this depth.
* @template {Uint} [Depth=0]
*   Current depth.
*/
/**
* @typedef {'skip' | boolean} Action
*   Union of the action types.
*
* @typedef {number} Index
*   Move to the sibling at `index` next (after node itself is completely
*   traversed).
*
*   Useful if mutating the tree, such as removing the node the visitor is
*   currently on, or any of its previous siblings.
*   Results less than 0 or greater than or equal to `children.length` stop
*   traversing the parent.
*
* @typedef {[(Action | null | undefined | void)?, (Index | null | undefined)?]} ActionTuple
*   List with one or two values, the first an action, the second an index.
*
* @typedef {Action | ActionTuple | Index | null | undefined | void} VisitorResult
*   Any value that can be returned from an enter visitor.
*
*   Like `VisitorResultExit`,
*   but `SKIP` can also be returned,
*   to not walk the children of the node,
*   and `ActionTuple` can be used to combine an action with an index.
*
* @typedef {Index | boolean | null | undefined | void} VisitorResultExit
*   Any value that can be returned from an exit visitor.
*/
/**
* @callback Visitor
*   Handle a node (matching `test`, if given) before its children.
*
*   Changes inside `node` are walked next.
*   Replacing or removing it is easier in `exit`.
*   When replacing or removing it here,
*   return `SKIP` (as otherwise its old children are walked),
*   or `[SKIP, index]` to continue with the node now at `index`.
*   Changing next siblings (in walk order) is fine;
*   changing previous siblings needs a new `Index`.
*   Removing an ancestor or changing its previous siblings is not supported.
* @param {Visited} node
*   Found node.
* @param {Array<VisitedParents>} ancestors
*   Ancestors of `node`.
* @param {number | undefined} index
*   Index of `node` in its parent (the last of `ancestors`),
*   or `undefined` for the tree itself.
* @returns {VisitorResult}
*   What to do next.
*
*   Like `VisitorExit`,
*   but `SKIP` can also be returned,
*   to not walk the children of `node`.
*   Passing a tuple back (`ActionTuple`) only makes sense as `[SKIP, Index]`.
* @template {UnistNode} [Visited=UnistNode]
*   Visited node type.
* @template {UnistParent} [VisitedParents=UnistParent]
*   Ancestor type.
*/
/**
* @callback VisitorExit
*   Handle a node (matching `test`, if given) after its children.
*
*   Changes inside `node` are not walked,
*   which makes this a good place to change `node` based on its children,
*   or to replace or remove it.
*   When removing `node` or changing previous siblings (in walk order),
*   return a new `Index`.
*   Removing an ancestor or changing its previous siblings is not supported.
* @param {Visited} node
*   Found node.
* @param {Array<VisitedParents>} ancestors
*   Ancestors of `node`.
* @param {number | undefined} index
*   Index of `node` in its parent (the last of `ancestors`),
*   or `undefined` for the tree itself.
* @returns {VisitorResultExit}
*   What to do next.
*
*   `CONTINUE` (`true`, nothing) continues as normal,
*   `EXIT` (`false`) stops traversing,
*   and `Index` continues at that sibling.
* @template {UnistNode} [Visited=UnistNode]
*   Visited node type.
* @template {UnistParent} [VisitedParents=UnistParent]
*   Ancestor type.
*/
/**
* @template {UnistNode} [Visited=UnistNode]
*   Visited node type.
* @template {UnistParent} [VisitedParents=UnistParent]
*   Ancestor type.
* @typedef Visitors
*   Handle nodes when entering and exiting them.
*   The `enter` visitor is optional while `exit` is required.
*
*   Pass an `enter` visitor directly to only handle nodes when entering them.
*
*   `enter` is called before children (if any) are walked and `exit` after that.
*   `exit` is still called when `enter` returns `SKIP`.
*   Both `enter` and `exit` are only called for nodes that match an optional `test`.
* @property {Visitor<Visited, VisitedParents> | null | undefined} [enter]
*   Handle a node before its children (optional).
* @property {VisitorExit<Visited, VisitedParents>} exit
*   Handle a node after its children.
*/
/**
* @typedef {Visitor<Matches<InclusiveDescendant<Tree>, Check>, Ancestor<Tree, Matches<InclusiveDescendant<Tree>, Check>>>} BuildVisitor
*   Build a typed `Visitor` function from a tree and a test.
*
*   It will infer which values are passed as `node` and which as `parents`.
* @template {UnistNode} [Tree=UnistNode]
*   Tree type.
* @template {Test} [Check=Test]
*   Test type.
*/
/**
* @typedef {Visitors<Matches<InclusiveDescendant<Tree>, Check>, Ancestor<Tree, Matches<InclusiveDescendant<Tree>, Check>>>} BuildVisitors
*   Build typed `Visitors` from a tree and a test.
*
*   It will infer which values are passed as `node` and which as `parents`.
* @template {UnistNode} [Tree=UnistNode]
*   Tree type.
* @template {Test} [Check=Test]
*   Test type.
*/
/** @type {Readonly<ActionTuple>} */
var empty = [];
/**
* Do not traverse this node’s children.
* Only works when entering a node.
*/
var SKIP = "skip";
/**
* Visit nodes, with ancestral information.
*
* This algorithm performs *depth-first* *tree traversal* in *preorder*
* (**NLR**) or if `reverse` is given,
* in *reverse preorder* (**NRL**).
* An `exit` visitor is called in *postorder* (**LRN**)
* or if `reverse` is given, in *reverse postorder* (**RLN**).
*
* You can choose which nodes are visited by passing a `test`.
* For complex tests, you should test yourself in a visitor, as it will be
* faster and will have improved type information.
*
* Walking the tree is an intensive task.
* Make use of the return values of the visitor when possible.
* Instead of walking a tree multiple times, walk it once, use `unist-util-is`
* to check if a node matches, and then perform different operations.
*
* You can change the tree.
* Changes inside a node made when entering it are walked,
* changes made when exiting it are not.
* See `Visitor` and `VisitorExit` for more info.
*
* @overload
* @param {Tree} tree
*   Tree to traverse.
* @param {Check} check
*   `unist-util-is`-compatible test.
* @param {BuildVisitor<Tree, Check>} enter
*   Handle each node when entering it.
* @param {boolean | null | undefined} [reverse]
*   Walk children from last to first;
*   for `enter`, reverse preorder (NRL) instead of preorder (NLR);
*   for `exit`, reverse postorder (RLN) instead of postorder (LRN).
* @returns {undefined}
*   Nothing.
*
* @overload
* @param {Tree} tree
*   Tree to traverse.
* @param {Check} check
*   `unist-util-is`-compatible test.
* @param {BuildVisitors<Tree, Check>} visitors
*   Handle each node when exiting it, and optionally when entering it.
* @param {boolean | null | undefined} [reverse]
*   Walk children from last to first;
*   for `enter`, reverse preorder (NRL) instead of preorder (NLR);
*   for `exit`, reverse postorder (RLN) instead of postorder (LRN).
* @returns {undefined}
*   Nothing.
*
* @overload
* @param {Tree} tree
*   Tree to traverse.
* @param {BuildVisitor<Tree>} enter
*   Handle each node when entering it.
* @param {boolean | null | undefined} [reverse]
*   Walk children from last to first;
*   for `enter`, reverse preorder (NRL) instead of preorder (NLR);
*   for `exit`, reverse postorder (RLN) instead of postorder (LRN).
* @returns {undefined}
*   Nothing.
*
* @overload
* @param {Tree} tree
*   Tree to traverse.
* @param {BuildVisitors<Tree>} visitors
*   Handle each node when exiting it, and optionally when entering it.
* @param {boolean | null | undefined} [reverse]
*   Walk children from last to first;
*   for `enter`, reverse preorder (NRL) instead of preorder (NLR);
*   for `exit`, reverse postorder (RLN) instead of postorder (LRN).
* @returns {undefined}
*   Nothing.
*
* @param {UnistNode} tree
*   Tree to traverse.
* @param {Visitor | Visitors | Test} testOrEnterOrVisitors
*   `unist-util-is`-compatible test, `enter`, or `visitors`.
* @param {Visitor | Visitors | boolean | null | undefined} [enterOrVisitorsOrReverse]
*   `enter`, `visitors`, or `reverse` after a test.
* @param {boolean | null | undefined} [reverse]
*   Walk children from last to first;
*   for `enter`, reverse preorder (NRL) instead of preorder (NLR);
*   for `exit`, reverse postorder (RLN) instead of postorder (LRN).
* @returns {undefined}
*   Nothing.
*
* @template {UnistNode} Tree
*   Node type.
* @template {Test} Check
*   `unist-util-is`-compatible test.
*/
function visitParents(tree, testOrEnterOrVisitors, enterOrVisitorsOrReverse, reverse) {
	if (!tree || typeof tree !== "object") throw new Error("Unexpected value `" + tree + "` for `tree`, expected node");
	let preorder = true;
	/** @type {Test} */
	let check;
	/** @type {Visitors | Visitor} */
	let visitors;
	/** @type {Visitor | null | undefined} */
	let enter;
	/** @type {VisitorExit | null | undefined} */
	let exit;
	if (typeof enterOrVisitorsOrReverse === "function" || enterOrVisitorsOrReverse && typeof enterOrVisitorsOrReverse === "object") {
		check = testOrEnterOrVisitors;
		visitors = enterOrVisitorsOrReverse;
		if (reverse) preorder = false;
	} else {
		visitors = testOrEnterOrVisitors;
		if (enterOrVisitorsOrReverse) preorder = false;
	}
	if (typeof visitors === "function") enter = visitors;
	else if (visitors && typeof visitors === "object") {
		if (visitors.enter === null || visitors.enter === void 0) {} else if (typeof visitors.enter === "function") enter = visitors.enter;
		else throw new Error("Unexpected value `" + visitors.enter + "` for `visitors.enter`, expected optional visitor");
		if (typeof visitors.exit === "function") exit = visitors.exit;
		else throw new Error("Unexpected value `" + visitors.exit + "` for `visitors.exit`, expected visitor (pass a visitor directly if you only want an enter visitor)");
	} else throw new Error("Unexpected value `" + visitors + "` for `enter` or `visitors`, expected visitor or object with visitors");
	const is = convert(check);
	const step = preorder ? 1 : -1;
	factory(tree, void 0, [])();
	/**
	* Create a function to visit a node.
	*
	* @param {UnistNode} node
	*   Node to visit.
	* @param {number | undefined} index
	*   Index of `node` in its parent.
	* @param {Array<UnistParent>} parents
	*   Ancestors of `node`.
	* @returns {() => Readonly<ActionTuple>}
	*   Visit `node`.
	*/
	function factory(node, index, parents) {
		const value = node && typeof node === "object" ? node : {};
		if (typeof value.type === "string") {
			const name = typeof value.tagName === "string" ? value.tagName : typeof value.name === "string" ? value.name : void 0;
			Object.defineProperty(visit, "name", { value: "node (" + color(node.type + (name ? "<" + name + ">" : "")) + ")" });
		}
		return visit;
		function visit() {
			const matches = !check || is(node, index, parents[parents.length - 1] || void 0);
			/** @type {Readonly<ActionTuple>} */
			let result = empty;
			if (enter && matches) {
				result = toResult(enter(node, parents, index));
				if (result[0] === false) return result;
			}
			if ("children" in node && node.children) {
				const nodeAsParent = node;
				if (nodeAsParent.children && result[0] !== "skip") {
					let offset = (preorder ? -1 : nodeAsParent.children.length) + step;
					const grandparents = [...parents, nodeAsParent];
					while (offset > -1 && offset < nodeAsParent.children.length) {
						const child = nodeAsParent.children[offset];
						const subresult = factory(child, offset, grandparents)();
						if (subresult[0] === false) return subresult;
						offset = typeof subresult[1] === "number" ? subresult[1] : offset + step;
					}
				}
			}
			if (exit && matches) {
				const exitResult = toResult(exit(node, parents, index));
				if (exitResult[0] === "skip") throw new Error("Unexpected value `" + exitResult[0] + "` from `exit`, expected `CONTINUE`, `EXIT`, index, or nothing");
				if (exitResult[0] === false || typeof exitResult[1] === "number") return exitResult;
			}
			return result;
		}
	}
}
/**
* Turn a return value into a clean result.
*
* @param {VisitorResult} value
*   Valid return values from visitors.
* @returns {Readonly<ActionTuple>}
*   Clean result.
*/
function toResult(value) {
	if (Array.isArray(value)) return value;
	if (typeof value === "number") return [true, value];
	return value === null || value === void 0 ? empty : [value];
}
//#endregion
//#region node_modules/mdast-util-find-and-replace/lib/index.js
/**
* @import {Nodes, Parents, PhrasingContent, Root, Text} from 'mdast'
* @import {BuildVisitor, Test, VisitorResult} from 'unist-util-visit-parents'
*/
/**
* @typedef RegExpMatchObject
*   Info on the match.
* @property {number} index
*   The index of the search at which the result was found.
* @property {string} input
*   A copy of the search string in the text node.
* @property {[...Array<Parents>, Text]} stack
*   All ancestors of the text node, where the last node is the text itself.
*
* @typedef {RegExp | string} Find
*   Pattern to find.
*
*   Strings are escaped and then turned into global expressions.
*
* @typedef {Array<FindAndReplaceTuple>} FindAndReplaceList
*   Several find and replaces, in array form.
*
* @typedef {[Find, Replace?]} FindAndReplaceTuple
*   Find and replace in tuple form.
*
* @typedef {ReplaceFunction | string | null | undefined} Replace
*   Thing to replace with.
*
* @callback ReplaceFunction
*   Callback called when a search matches.
* @param {...any} parameters
*   The parameters are the result of corresponding search expression:
*
*   * `value` (`string`) — whole match
*   * `...capture` (`Array<string>`) — matches from regex capture groups
*   * `match` (`RegExpMatchObject`) — info on the match
* @returns {Array<PhrasingContent> | PhrasingContent | string | false | null | undefined}
*   Thing to replace with.
*
*   * when `null`, `undefined`, `''`, remove the match
*   * …or when `false`, do not replace at all
*   * …or when `string`, replace with a text node of that value
*   * …or when `Node` or `Array<Node>`, replace with those nodes
*
* @typedef {[RegExp, ReplaceFunction]} Pair
*   Normalized find and replace.
*
* @typedef {Array<Pair>} Pairs
*   All find and replaced.
*
* @typedef Options
*   Configuration.
* @property {Test | null | undefined} [ignore]
*   Test for which nodes to ignore (optional).
*/
/**
* Find patterns in a tree and replace them.
*
* The algorithm searches the tree in *preorder* for complete values in `Text`
* nodes.
* Partial matches are not supported.
*
* @param {Nodes} tree
*   Tree to change.
* @param {FindAndReplaceList | FindAndReplaceTuple} list
*   Patterns to find.
* @param {Options | null | undefined} [options]
*   Configuration (optional).
* @returns {undefined}
*   Nothing.
*/
function findAndReplace(tree, list, options) {
	const ignored = convert((options || {}).ignore || []);
	const pairs = toPairs(list);
	let pairIndex = -1;
	while (++pairIndex < pairs.length) visitParents(tree, visitor);
	/**
	* Handle text nodes and skip ignored nodes.
	*
	* @type {BuildVisitor<Root>}
	*/
	function visitor(node, parents, index) {
		if (node.type === "text" && typeof index === "number") return handler(node, parents, index);
		if (ignored(node, index, parents[parents.length - 1])) return SKIP;
	}
	/**
	* Handle a text node which is not in an ignored parent.
	*
	* @param {Text} node
	*   Text node to search in.
	* @param {Array<Parents>} parents
	*   Ancestors of `node`.
	* @param {number} index
	*   Index of `node` in its parent.
	* @returns {VisitorResult}
	*   Where to continue visiting.
	*/
	function handler(node, parents, index) {
		const parent = parents[parents.length - 1];
		const find = pairs[pairIndex][0];
		const replace = pairs[pairIndex][1];
		let start = 0;
		let change = false;
		/** @type {Array<PhrasingContent>} */
		let nodes = [];
		find.lastIndex = 0;
		let match = find.exec(node.value);
		while (match) {
			const position = match.index;
			/** @type {RegExpMatchObject} */
			const matchObject = {
				index: match.index,
				input: match.input,
				stack: [...parents, node]
			};
			let value = replace(...match, matchObject);
			if (typeof value === "string") value = value.length > 0 ? {
				type: "text",
				value
			} : void 0;
			if (value === false) find.lastIndex = position + 1;
			else {
				if (start !== position) add({
					type: "text",
					value: node.value.slice(start, position)
				});
				if (Array.isArray(value)) for (const child of value) add(child);
				else if (value) add(value);
				start = position + match[0].length;
				change = true;
			}
			if (!find.global) break;
			match = find.exec(node.value);
		}
		if (change) {
			if (start < node.value.length) add({
				type: "text",
				value: node.value.slice(start)
			});
			parent.children.splice(index, 1, ...nodes);
		} else nodes = [node];
		return index + nodes.length;
		/**
		* Add a node.
		*
		* @param {PhrasingContent} child
		*   Node to add.
		* @returns {undefined}
		*   Nothing.
		*/
		function add(child) {
			const previous = nodes[nodes.length - 1];
			if (previous && previous.type === "text" && child.type === "text") previous.value += child.value;
			else nodes.push(child);
		}
	}
}
/**
* Turn a tuple or a list of tuples into pairs.
*
* @param {FindAndReplaceList | FindAndReplaceTuple} tupleOrList
*   Schema.
* @returns {Pairs}
*   Clean pairs.
*/
function toPairs(tupleOrList) {
	if (!Array.isArray(tupleOrList)) throw new TypeError("Expected find and replace tuple or list of tuples");
	/** @type {Pairs} */
	const result = [];
	const list = !tupleOrList[0] || Array.isArray(tupleOrList[0]) ? tupleOrList : [tupleOrList];
	let index = -1;
	while (++index < list.length) {
		const tuple = list[index];
		result.push([toExpression(tuple[0]), toFunction(tuple[1])]);
	}
	return result;
}
/**
* Turn a find into an expression.
*
* @param {Find} find
*   Pattern to find.
* @returns {RegExp}
*   Global expression.
*/
function toExpression(find) {
	return typeof find === "string" ? new RegExp(escapeStringRegexp(find), "g") : find;
}
/**
* Turn a replace into a function.
*
* @param {Replace} replace
*   Thing to replace with.
* @returns {ReplaceFunction}
*   Function that returns that thing.
*/
function toFunction(replace) {
	return typeof replace === "function" ? replace : function() {
		return replace;
	};
}
//#endregion
export { visitParents as n, convert as r, findAndReplace as t };
