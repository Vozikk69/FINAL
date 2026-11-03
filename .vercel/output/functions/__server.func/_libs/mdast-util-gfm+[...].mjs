import "./devlop.mjs";
import { _ as normalizeIdentifier, b as toString, c as asciiAlpha, d as asciiPunctuation, g as unicodeWhitespace, h as unicodePunctuation, l as asciiAlphanumeric, n as htmlBlockNames, o as classifyCharacter, r as htmlRawNames } from "./mdast-util-from-markdown+[...].mjs";
import { n as visitParents, r as convert, t as findAndReplace } from "./mdast-util-find-and-replace+[...].mjs";
import { t as ccount } from "./ccount.mjs";
import { t as markdownTable } from "./markdown-table.mjs";
import { t as longestStreak } from "./longest-streak.mjs";
//#region node_modules/unist-util-visit/lib/index.js
/**
* @import {Node as UnistNode, Parent as UnistParent} from 'unist'
* @import {
*   InclusiveDescendant,
*   Matches,
*   Visitors as ParentsVisitors,
*   VisitorResult,
*   VisitorResultExit
* } from 'unist-util-visit-parents'
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
* @callback Visitor
*   Handle a node (matching `test`, if given) before its children.
*
*   Like `Visitor` in `unist-util-visit-parents`,
*   but with `index` and `parent` instead of `parents`.
* @param {Visited} node
*   Found node.
* @param {Visited extends UnistNode ? number | undefined : never} index
*   Index of `node` in `parent`,
*   or `undefined` for the tree itself.
* @param {Ancestor extends UnistParent ? Ancestor | undefined : never} parent
*   Parent of `node`,
*   or `undefined` for the tree itself.
* @returns {VisitorResult}
*   What to do next.
* @template {UnistNode} [Visited=UnistNode]
*   Visited node type.
* @template {UnistParent} [Ancestor=UnistParent]
*   Ancestor type.
*/
/**
* @callback VisitorExit
*   Handle a node (matching `test`, if given) after its children.
*
*   Like `VisitorExit` in `unist-util-visit-parents`,
*   but with `index` and `parent` instead of `parents`.
* @param {Visited} node
*   Found node.
* @param {Visited extends UnistNode ? number | undefined : never} index
*   Index of `node` in `parent`,
*   or `undefined` for the tree itself.
* @param {Ancestor extends UnistParent ? Ancestor | undefined : never} parent
*   Parent of `node`,
*   or `undefined` for the tree itself.
* @returns {VisitorResultExit}
*   What to do next.
* @template {UnistNode} [Visited=UnistNode]
*   Visited node type.
* @template {UnistParent} [Ancestor=UnistParent]
*   Ancestor type.
*/
/**
* @template {UnistNode} [Visited=UnistNode]
*   Visited node type.
* @template {UnistParent} [Ancestor=UnistParent]
*   Ancestor type.
* @typedef Visitors
*   Handle nodes when entering and exiting them.
*
*   Like `Visitors` in `unist-util-visit-parents`.
* @property {Visitor<Visited, Ancestor> | null | undefined} [enter]
*   Handle a node before its children (optional).
* @property {VisitorExit<Visited, Ancestor>} exit
*   Handle a node after its children.
*/
/**
* @typedef {Visitor<Visited, Parent<Ancestor, Visited>>} BuildVisitorFromMatch
*   Build a typed `Visitor` function from a node and all possible parents.
*
*   It will infer which values are passed as `node` and which as `parent`.
* @template {UnistNode} Visited
*   Node type.
* @template {UnistParent} Ancestor
*   Parent type.
*/
/**
* @typedef {(
*   BuildVisitorFromMatch<
*     Matches<Descendant, Check>,
*     Extract<Descendant, UnistParent>
*   >
* )} BuildVisitorFromDescendants
*   Build a typed `Visitor` function from a list of descendants and a test.
*
*   It will infer which values are passed as `node` and which as `parent`.
* @template {UnistNode} Descendant
*   Node type.
* @template {Test} Check
*   Test type.
*/
/**
* @typedef {(
*   BuildVisitorFromDescendants<
*     InclusiveDescendant<Tree>,
*     Check
*   >
* )} BuildVisitor
*   Build a typed `Visitor` function from a tree and a test.
*
*   It will infer which values are passed as `node` and which as `parent`.
* @template {UnistNode} [Tree=UnistNode]
*   Node type.
* @template {Test} [Check=Test]
*   Test type.
*/
/**
* @typedef {(
*   Visitors<
*     Matches<InclusiveDescendant<Tree>, Check>,
*     Parent<
*       Extract<InclusiveDescendant<Tree>, UnistParent>,
*       Matches<InclusiveDescendant<Tree>, Check>
*     >
*   >
* )} BuildVisitors
*   Build typed `Visitors` from a tree and a test.
*
*   It will infer which values are passed as `node` and which as `parent`.
* @template {UnistNode} [Tree=UnistNode]
*   Node type.
* @template {Test} [Check=Test]
*   Test type.
*/
/**
* Visit nodes.
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
* @param {BuildVisitor<Tree, Check> | BuildVisitors<Tree, Check>} visitors
*   Handle each node when entering it,
*   or `{enter, exit}` to also handle it when exiting it.
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
* @param {BuildVisitor<Tree> | BuildVisitors<Tree>} visitors
*   Handle each node when entering it,
*   or `{enter, exit}` to also handle it when exiting it.
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
* @param {boolean | null | undefined} [maybeReverse]
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
function visit(tree, testOrEnterOrVisitors, enterOrVisitorsOrReverse, maybeReverse) {
	/** @type {Test} */
	let check;
	/** @type {Visitor | Visitors} */
	let visitors;
	/** @type {boolean | null | undefined} */
	let reverse;
	if (typeof enterOrVisitorsOrReverse === "function" || enterOrVisitorsOrReverse && typeof enterOrVisitorsOrReverse === "object") {
		check = testOrEnterOrVisitors;
		visitors = enterOrVisitorsOrReverse;
		reverse = maybeReverse;
	} else {
		visitors = testOrEnterOrVisitors;
		reverse = enterOrVisitorsOrReverse;
	}
	if (typeof visitors === "function") visitParents(tree, check, wrap(visitors), reverse);
	else visitParents(tree, check, wrapVisitors(visitors), reverse);
}
/**
* Turn `visit` visitors into `visitParents` visitors.
*
* @param {Visitors} visitors
*   Visitors for `visit`.
* @returns {ParentsVisitors}
*   Visitors for `visitParents`.
*/
function wrapVisitors(visitors) {
	if (!visitors || typeof visitors !== "object") return visitors;
	return {
		enter: typeof visitors.enter === "function" ? wrap(visitors.enter) : visitors.enter,
		exit: typeof visitors.exit === "function" ? wrap(visitors.exit) : visitors.exit
	};
}
/**
* Turn a `visit` visitor into a `visitParents` one.
*
* @template {VisitorResult} Result
*   Result type.
* @param {(node: UnistNode, index: number | undefined, parent: UnistParent | undefined) => Result} visitor
*   Visitor for `visit`.
* @returns {(node: UnistNode, parents: Array<UnistParent>, index: number | undefined) => Result}
*   Visitor for `visitParents`.
*/
function wrap(visitor) {
	return overload;
	/**
	* Call `visitor` with `index` and `parent` instead of `parents`.
	*
	* @param {UnistNode} node
	*   Visited node.
	* @param {Array<UnistParent>} parents
	*   Ancestors of `node`.
	* @param {number | undefined} index
	*   Index of `node` in its parent.
	* @returns {Result}
	*   What to do next.
	*/
	function overload(node, parents, index) {
		return visitor(node, index, parents[parents.length - 1]);
	}
}
//#endregion
//#region node_modules/mdast-util-gfm-autolink-literal/lib/index.js
/**
* @import {RegExpMatchObject, ReplaceFunction} from 'mdast-util-find-and-replace'
* @import {CompileContext, Extension as FromMarkdownExtension, Handle as FromMarkdownHandle, Transform as FromMarkdownTransform} from 'mdast-util-from-markdown'
* @import {ConstructName, Options as ToMarkdownExtension} from 'mdast-util-to-markdown'
* @import {Link, PhrasingContent} from 'mdast'
*/
/** @type {ConstructName} */
var inConstruct = "phrasing";
/** @type {Array<ConstructName>} */
var notInConstruct = [
	"autolink",
	"link",
	"image",
	"label"
];
/**
* Create an extension for `mdast-util-from-markdown` to enable GFM autolink
* literals in markdown.
*
* @returns {FromMarkdownExtension}
*   Extension for `mdast-util-to-markdown` to enable GFM autolink literals.
*/
function gfmAutolinkLiteralFromMarkdown() {
	return {
		transforms: [transformGfmAutolinkLiterals],
		enter: {
			literalAutolink: enterLiteralAutolink,
			literalAutolinkEmail: enterLiteralAutolinkValue,
			literalAutolinkHttp: enterLiteralAutolinkValue,
			literalAutolinkWww: enterLiteralAutolinkValue
		},
		exit: {
			literalAutolink: exitLiteralAutolink,
			literalAutolinkEmail: exitLiteralAutolinkEmail,
			literalAutolinkHttp: exitLiteralAutolinkHttp,
			literalAutolinkWww: exitLiteralAutolinkWww
		}
	};
}
/**
* Create an extension for `mdast-util-to-markdown` to enable GFM autolink
* literals in markdown.
*
* @returns {ToMarkdownExtension}
*   Extension for `mdast-util-to-markdown` to enable GFM autolink literals.
*/
function gfmAutolinkLiteralToMarkdown() {
	return { unsafe: [
		{
			character: "@",
			before: "[+\\-.\\w]",
			after: "[\\-.\\w]",
			inConstruct,
			notInConstruct
		},
		{
			character: ".",
			before: "[Ww]",
			after: "[\\-.\\w]",
			inConstruct,
			notInConstruct
		},
		{
			character: ":",
			before: "[ps]",
			after: "\\/",
			inConstruct,
			notInConstruct
		}
	] };
}
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function enterLiteralAutolink(token) {
	this.enter({
		type: "link",
		title: null,
		url: "",
		children: []
	}, token);
}
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function enterLiteralAutolinkValue(token) {
	this.config.enter.autolinkProtocol.call(this, token);
}
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function exitLiteralAutolinkHttp(token) {
	this.config.exit.autolinkProtocol.call(this, token);
}
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function exitLiteralAutolinkWww(token) {
	this.config.exit.data.call(this, token);
	const node = this.stack[this.stack.length - 1];
	node.type;
	node.url = "http://" + this.sliceSerialize(token);
}
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function exitLiteralAutolinkEmail(token) {
	this.config.exit.autolinkEmail.call(this, token);
}
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function exitLiteralAutolink(token) {
	this.exit(token);
}
/** @type {FromMarkdownTransform} */
function transformGfmAutolinkLiterals(tree) {
	findAndReplace(tree, [[/(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/gi, findUrl], [/(?<=^|\s|\p{P}|\p{S})([-.\w+]+)@([-\w]+(?:\.[-\w]+)+)/gu, findEmail]], { ignore: ["link", "linkReference"] });
}
/**
* @type {ReplaceFunction}
* @param {string} _
* @param {string} protocol
* @param {string} domain
* @param {string} path
* @param {RegExpMatchObject} match
* @returns {Array<PhrasingContent> | Link | false}
*/
function findUrl(_, protocol, domain, path, match) {
	let prefix = "";
	if (!previous(match)) return false;
	if (/^w/i.test(protocol)) {
		domain = protocol + domain;
		protocol = "";
		prefix = "http://";
	}
	if (!isCorrectDomain(domain)) return false;
	const parts = splitUrl(domain + path);
	if (!parts[0]) return false;
	/** @type {Link} */
	const result = {
		type: "link",
		title: null,
		url: prefix + protocol + parts[0],
		children: [{
			type: "text",
			value: protocol + parts[0]
		}]
	};
	if (parts[1]) return [result, {
		type: "text",
		value: parts[1]
	}];
	return result;
}
/**
* @type {ReplaceFunction}
* @param {string} _
* @param {string} atext
* @param {string} label
* @param {RegExpMatchObject} match
* @returns {Link | false}
*/
function findEmail(_, atext, label, match) {
	if (!previous(match, true) || /[-\d_]$/.test(label)) return false;
	return {
		type: "link",
		title: null,
		url: "mailto:" + atext + "@" + label,
		children: [{
			type: "text",
			value: atext + "@" + label
		}]
	};
}
/**
* @param {string} domain
* @returns {boolean}
*/
function isCorrectDomain(domain) {
	const parts = domain.split(".");
	if (parts.length < 2 || parts[parts.length - 1] && (/_/.test(parts[parts.length - 1]) || !/[a-zA-Z\d]/.test(parts[parts.length - 1])) || parts[parts.length - 2] && (/_/.test(parts[parts.length - 2]) || !/[a-zA-Z\d]/.test(parts[parts.length - 2]))) return false;
	return true;
}
/**
* @param {string} url
* @returns {[string, string | undefined]}
*/
function splitUrl(url) {
	const trailExec = /[!"&'),.:;<>?\]}]+$/.exec(url);
	if (!trailExec) return [url, void 0];
	url = url.slice(0, trailExec.index);
	let trail = trailExec[0];
	let closingParenIndex = trail.indexOf(")");
	const openingParens = ccount(url, "(");
	let closingParens = ccount(url, ")");
	while (closingParenIndex !== -1 && openingParens > closingParens) {
		url += trail.slice(0, closingParenIndex + 1);
		trail = trail.slice(closingParenIndex + 1);
		closingParenIndex = trail.indexOf(")");
		closingParens++;
	}
	return [url, trail];
}
/**
* @param {RegExpMatchObject} match
* @param {boolean | null | undefined} [email=false]
* @returns {boolean}
*/
function previous(match, email) {
	const code = match.input.charCodeAt(match.index - 1);
	return (match.index === 0 || unicodeWhitespace(code) || unicodePunctuation(code)) && (!email || code !== 47);
}
//#endregion
//#region node_modules/mdast-util-gfm-footnote/lib/index.js
/**
* @import {
*   CompileContext,
*   Extension as FromMarkdownExtension,
*   Handle as FromMarkdownHandle
* } from 'mdast-util-from-markdown'
* @import {ToMarkdownOptions} from 'mdast-util-gfm-footnote'
* @import {
*   Handle as ToMarkdownHandle,
*   Map,
*   Options as ToMarkdownExtension
* } from 'mdast-util-to-markdown'
* @import {FootnoteDefinition, FootnoteReference} from 'mdast'
*/
footnoteReference.peek = footnoteReferencePeek;
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function enterFootnoteCallString() {
	this.buffer();
}
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function enterFootnoteCall(token) {
	this.enter({
		type: "footnoteReference",
		identifier: "",
		label: ""
	}, token);
}
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function enterFootnoteDefinitionLabelString() {
	this.buffer();
}
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function enterFootnoteDefinition(token) {
	this.enter({
		type: "footnoteDefinition",
		identifier: "",
		label: "",
		children: []
	}, token);
}
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function exitFootnoteCallString(token) {
	const label = this.resume();
	const node = this.stack[this.stack.length - 1];
	node.type;
	node.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
	node.label = label;
}
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function exitFootnoteCall(token) {
	this.exit(token);
}
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function exitFootnoteDefinitionLabelString(token) {
	const label = this.resume();
	const node = this.stack[this.stack.length - 1];
	node.type;
	node.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
	node.label = label;
}
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function exitFootnoteDefinition(token) {
	this.exit(token);
}
/** @type {ToMarkdownHandle} */
function footnoteReferencePeek() {
	return "[";
}
/**
* @type {ToMarkdownHandle}
* @param {FootnoteReference} node
*/
function footnoteReference(node, _, state, info) {
	const tracker = state.createTracker(info);
	let value = tracker.move("[^");
	const exit = state.enter("footnoteReference");
	const subexit = state.enter("reference");
	value += tracker.move(state.safe(state.associationId(node), {
		after: "]",
		before: value
	}));
	subexit();
	exit();
	value += tracker.move("]");
	return value;
}
/**
* Create an extension for `mdast-util-from-markdown` to enable GFM footnotes
* in markdown.
*
* @returns {FromMarkdownExtension}
*   Extension for `mdast-util-from-markdown`.
*/
function gfmFootnoteFromMarkdown() {
	return {
		enter: {
			gfmFootnoteCallString: enterFootnoteCallString,
			gfmFootnoteCall: enterFootnoteCall,
			gfmFootnoteDefinitionLabelString: enterFootnoteDefinitionLabelString,
			gfmFootnoteDefinition: enterFootnoteDefinition
		},
		exit: {
			gfmFootnoteCallString: exitFootnoteCallString,
			gfmFootnoteCall: exitFootnoteCall,
			gfmFootnoteDefinitionLabelString: exitFootnoteDefinitionLabelString,
			gfmFootnoteDefinition: exitFootnoteDefinition
		}
	};
}
/**
* Create an extension for `mdast-util-to-markdown` to enable GFM footnotes
* in markdown.
*
* @param {ToMarkdownOptions | null | undefined} [options]
*   Configuration (optional).
* @returns {ToMarkdownExtension}
*   Extension for `mdast-util-to-markdown`.
*/
function gfmFootnoteToMarkdown(options) {
	let firstLineBlank = false;
	if (options && options.firstLineBlank) firstLineBlank = true;
	return {
		handlers: {
			footnoteDefinition,
			footnoteReference
		},
		unsafe: [{
			character: "[",
			inConstruct: [
				"label",
				"phrasing",
				"reference"
			]
		}]
	};
	/**
	* @type {ToMarkdownHandle}
	* @param {FootnoteDefinition} node
	*/
	function footnoteDefinition(node, _, state, info) {
		const tracker = state.createTracker(info);
		let value = tracker.move("[^");
		const exit = state.enter("footnoteDefinition");
		const subexit = state.enter("label");
		value += tracker.move(state.safe(state.associationId(node), {
			before: value,
			after: "]"
		}));
		subexit();
		value += tracker.move("]:");
		if (node.children && node.children.length > 0) {
			tracker.shift(4);
			value += tracker.move((firstLineBlank ? "\n" : " ") + state.indentLines(state.containerFlow(node, tracker.current()), firstLineBlank ? mapAll : mapExceptFirst));
		}
		exit();
		return value;
	}
}
/** @type {Map} */
function mapExceptFirst(line, index, blank) {
	return index === 0 ? line : mapAll(line, index, blank);
}
/** @type {Map} */
function mapAll(line, index, blank) {
	return (blank ? "" : "    ") + line;
}
//#endregion
//#region node_modules/mdast-util-gfm-strikethrough/lib/index.js
/**
* @import {Delete} from 'mdast'
* @import {
*   CompileContext,
*   Extension as FromMarkdownExtension,
*   Handle as FromMarkdownHandle
* } from 'mdast-util-from-markdown'
* @import {
*   Attention,
*   ConstructName,
*   Handle as ToMarkdownHandle,
*   Options as ToMarkdownExtension
* } from 'mdast-util-to-markdown'
*/
/**
* List of constructs that occur in phrasing (paragraphs, headings), but cannot
* contain strikethrough.
* So they sort of cancel each other out.
* Note: could use a better name.
*
* Note: keep in sync with: <https://github.com/syntax-tree/mdast-util-to-markdown/blob/8ce8dbf/lib/unsafe.js#L14>
*
* @type {Array<ConstructName>}
*/
var constructsWithoutStrikethrough = [
	"autolink",
	"destinationLiteral",
	"destinationRaw",
	"reference",
	"titleQuote",
	"titleApostrophe"
];
handleDelete.attention = attentionDelete;
handleDelete.peek = peekDelete;
/**
* Create an extension for `mdast-util-from-markdown` to enable GFM
* strikethrough in markdown.
*
* @returns {FromMarkdownExtension}
*   Extension for `mdast-util-from-markdown` to enable GFM strikethrough.
*/
function gfmStrikethroughFromMarkdown() {
	return {
		canContainEols: ["delete"],
		enter: { strikethrough: enterStrikethrough },
		exit: { strikethrough: exitStrikethrough }
	};
}
/**
* Create an extension for `mdast-util-to-markdown` to enable GFM
* strikethrough in markdown.
*
* @returns {ToMarkdownExtension}
*   Extension for `mdast-util-to-markdown` to enable GFM strikethrough.
*/
function gfmStrikethroughToMarkdown() {
	return {
		handlers: { delete: handleDelete },
		unsafe: [{
			character: "~",
			inConstruct: "phrasing",
			notInConstruct: constructsWithoutStrikethrough
		}]
	};
}
/**
* Enter strikethrough.
*
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function enterStrikethrough(token) {
	this.enter({
		type: "delete",
		children: [],
		position: void 0
	}, token);
}
/**
* Exit strikethrough.
*
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function exitStrikethrough(token) {
	this.exit(token);
}
/**
* Serialize a delete node.
*
* @type {ToMarkdownHandle}
* @param {Delete} node
*   Node to serialize.
*/
function handleDelete(node, _, state, info) {
	const tracker = state.createTracker(info);
	const sequence = state.stack.includes("strikethrough") ? "~" : "~~";
	const exit = state.enter("strikethrough");
	let value = tracker.move(sequence);
	value += state.containerPhrasing(node, {
		...tracker.current(),
		before: value,
		after: "~"
	});
	value += tracker.move(sequence);
	exit();
	return value;
}
/**
* Serialize a delete node as attention.
*
* @type {Attention}
*/
function attentionDelete() {
	return {
		construct: "strikethrough",
		markers: ["~"],
		sizes: [2, 1]
	};
}
/**
* Peek the first character of a delete node.
*
* @type {ToMarkdownHandle}
*/
function peekDelete() {
	return "~";
}
//#endregion
//#region node_modules/mdast-util-phrasing/lib/index.js
/**
* @typedef {import('mdast').Html} Html
* @typedef {import('mdast').PhrasingContent} PhrasingContent
*/
/**
* Check if the given value is *phrasing content*.
*
* > 👉 **Note**: Excludes `html`, which can be both phrasing or flow.
*
* @param node
*   Thing to check, typically `Node`.
* @returns
*   Whether `value` is phrasing content.
*/
var phrasing$1 = convert([
	"break",
	"delete",
	"emphasis",
	"footnote",
	"footnoteReference",
	"image",
	"imageReference",
	"inlineCode",
	"inlineMath",
	"link",
	"linkReference",
	"mdxJsxTextElement",
	"mdxTextExpression",
	"strong",
	"text",
	"textDirective"
]);
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/blockquote.js
/**
* @import {Blockquote, Parents} from 'mdast'
* @import {Info, Map, State} from 'mdast-util-to-markdown'
*/
/**
* Serialize a blockquote node.
*
* @param {Blockquote} node
*   Node to serialize.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function blockquote(node, _, state, info) {
	const exit = state.enter("blockquote");
	const tracker = state.createTracker(info);
	tracker.move("> ");
	tracker.shift(2);
	const value = state.indentLines(state.containerFlow(node, tracker.current()), map$1);
	exit();
	return value;
}
/**
* Indent lines w/ blockquote markers.
*
* @type {Map}
*/
function map$1(line, _, blank) {
	return ">" + (blank ? "" : " ") + line;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/pattern-in-scope.js
/**
* @import {ConstructName, Unsafe} from 'mdast-util-to-markdown'
*/
/**
* Check if a pattern is in scope based on the current stack of constructs.
*
* @param {Array<ConstructName>} stack
*   Current stack of constructs.
* @param {Unsafe} pattern
*   Pattern to check.
* @returns {boolean}
*   Whether the pattern is in scope.
*/
function patternInScope(stack, pattern) {
	return listInScope(stack, pattern.inConstruct, true) && !listInScope(stack, pattern.notInConstruct, false);
}
/**
* Check if any of the constructs in the list are present in the stack.
*
* @param {Array<ConstructName>} stack
*   Current stack of constructs.
* @param {Unsafe['inConstruct']} list
*   List of constructs to check for in the stack.
* @param {boolean} none
*   Value to return if the list is empty or not provided.
* @returns {boolean}
*   Whether any of the constructs in the list are present in the stack.
*/
function listInScope(stack, list, none) {
	if (typeof list === "string") list = [list];
	if (!list || list.length === 0) return none;
	let index = -1;
	while (++index < list.length) if (stack.includes(list[index])) return true;
	return false;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/break.js
/**
* @import {Break, Parents} from 'mdast'
* @import {Info, State} from 'mdast-util-to-markdown'
*/
/**
* Serialize a break node.
*
* @param {Break} _
*   Node to serialize.
* @param {Parents | undefined} _1
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function hardBreak(_, _1, state, info) {
	let index = -1;
	while (++index < state.unsafe.length) {
		const pattern = state.unsafe[index];
		if (pattern.character === "\n" && !pattern.before && !pattern.after && patternInScope(state.stack, pattern)) return /[\t ]/.test(info.before) ? "" : " ";
	}
	return "\\\n";
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/format-code-as-indented.js
/**
* @import {State} from 'mdast-util-to-markdown'
* @import {Code} from 'mdast'
*/
/**
* Checks if a code block can be formatted as an indented code block.
*
* @param {Code} node
*   Node to check.
* @param {State} state
*   Info passed around.
* @returns {boolean}
*   Whether the code can be formatted as an indented code block.
*/
function formatCodeAsIndented(node, state) {
	return Boolean(state.options.fences === false && node.value && !node.lang && /[^\n\r ]/.test(node.value) && !/^[\t ]*(?:[\n\r]|$)|(?:^|[\n\r])[\t ]*$/.test(node.value));
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/check-fence.js
/**
* @import {Options, State} from 'mdast-util-to-markdown'
*/
/**
* Checks the preferred fence option.
*
* @param {State} state
*   Info passed around.
* @returns {Exclude<Options['fence'], null | undefined>}
*   Preferred fence marker.
*/
function checkFence(state) {
	const marker = state.options.fence || "`";
	if (marker !== "`" && marker !== "~") throw new Error("Cannot serialize code with `" + marker + "` for `options.fence`, expected `` ` `` or `~`");
	return marker;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/code.js
/**
* @import {Info, Map, State} from 'mdast-util-to-markdown'
* @import {Code, Parents} from 'mdast'
*/
/**
* Serialize a code node.
*
* @param {Code} node
*   Node to serialize.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function code(node, _, state, info) {
	const marker = checkFence(state);
	const raw = node.value || "";
	if (formatCodeAsIndented(node, state)) {
		const exit = state.enter("codeIndented");
		const value = state.indentLines(raw, map);
		exit();
		return value;
	}
	const tracker = state.createTracker(info);
	const sequence = marker.repeat(Math.max(longestStreak(raw, marker) + 1, 3));
	const exit = state.enter("codeFenced");
	const suffix = marker === "`" ? "GraveAccent" : "Tilde";
	let value = tracker.move(sequence);
	if (node.lang) {
		const subexit = state.enter(`codeFencedLang${suffix}`);
		value += tracker.move(state.safe(node.lang, {
			before: value,
			after: " ",
			encode: ["`"],
			...tracker.current()
		}));
		subexit();
	}
	if (node.lang && node.meta) {
		const subexit = state.enter(`codeFencedMeta${suffix}`);
		value += tracker.move(" ");
		value += tracker.move(state.safe(node.meta, {
			before: value,
			after: "\n",
			encode: ["`"],
			...tracker.current()
		}));
		subexit();
	}
	value += tracker.move("\n");
	if (raw) value += tracker.move(raw + "\n");
	value += tracker.move(sequence);
	exit();
	return value;
}
/**
* Indent lines w/ code indent.
*
* @type {Map}
*/
function map(line, _, blank) {
	return (blank ? "" : "    ") + line;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/check-quote.js
/**
* @import {Options, State} from 'mdast-util-to-markdown'
*/
/**
* Checks the preferred quote option.
*
* @param {State} state
*   Info passed around.
* @returns {Exclude<Options['quote'], null | undefined>}
*   Preferred quote.
*/
function checkQuote(state) {
	const marker = state.options.quote || "\"";
	if (marker !== "\"" && marker !== "'") throw new Error("Cannot serialize title with `" + marker + "` for `options.quote`, expected `\"`, or `'`");
	return marker;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/definition.js
/**
* @import {Info, State} from 'mdast-util-to-markdown'
* @import {Definition, Parents} from 'mdast'
*/
/**
* Serialize a definition node.
*
* @param {Definition} node
*   Node to serialize.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function definition(node, _, state, info) {
	const quote = checkQuote(state);
	const suffix = quote === "\"" ? "Quote" : "Apostrophe";
	const exit = state.enter("definition");
	let subexit = state.enter("label");
	const tracker = state.createTracker(info);
	let value = tracker.move("[");
	value += tracker.move(state.safe(state.associationId(node), {
		before: value,
		after: "]",
		...tracker.current()
	}));
	value += tracker.move("]: ");
	subexit();
	if (!node.url || /[\0- \u007F]/.test(node.url)) {
		subexit = state.enter("destinationLiteral");
		value += tracker.move("<");
		value += tracker.move(state.safe(node.url, {
			before: value,
			after: ">",
			...tracker.current()
		}));
		value += tracker.move(">");
	} else {
		subexit = state.enter("destinationRaw");
		value += tracker.move(state.safe(node.url, {
			before: value,
			after: node.title ? " " : "\n",
			...tracker.current()
		}));
	}
	subexit();
	if (node.title) {
		subexit = state.enter(`title${suffix}`);
		value += tracker.move(" " + quote);
		value += tracker.move(state.safe(node.title, {
			before: value,
			after: quote,
			...tracker.current()
		}));
		value += tracker.move(quote);
		subexit();
	}
	exit();
	return value;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/check-emphasis.js
/**
* @import {Options, State} from 'mdast-util-to-markdown'
*/
/**
* Checks the preferred emphasis option.
*
* @param {State} state
*   Info passed around.
* @returns {Exclude<Options['emphasis'], null | undefined>}
*   Preferred emphasis marker.
*/
function checkEmphasis(state) {
	const marker = state.options.emphasis || "*";
	if (marker !== "*" && marker !== "_") throw new Error("Cannot serialize emphasis with `" + marker + "` for `options.emphasis`, expected `*`, or `_`");
	return marker;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/character.js
/**
* Get the first character of a value.
*
* Is aware of astral characters (such as emoji).
*
* @param {string} value
*   Value.
* @returns {string}
*   First character; empty if `value` is empty.
*/
function firstCharacter(value) {
	const code = value.codePointAt(0);
	return code === void 0 ? "" : String.fromCodePoint(code);
}
/**
* Get the last character of a value.
*
* Is aware of astral characters (such as emoji).
*
* @param {string} value
*   Value.
* @returns {string}
*   Last character; empty if `value` is empty.
*/
function lastCharacter(value) {
	const code = value.codePointAt(value.length - 2);
	return code !== void 0 && code > 65535 ? value.slice(-2) : value.slice(-1);
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/encode-character-reference.js
/**
* Encode a code point as a character reference.
*
* @param {number} code
*   Code point to encode.
* @returns {string}
*   Encoded character reference.
*/
function encodeCharacterReference(code) {
	return "&#x" + code.toString(16).toUpperCase() + ";";
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/encode-info.js
/**
* @import {EncodeSides} from '../types.js'
*/
/**
* Check whether to encode (as a character reference) the characters
* surrounding an attention run.
*
* Which characters are around an attention run influence whether it works or
* not.
*
* See <https://github.com/orgs/syntax-tree/discussions/60> for more info.
* See this markdown in a particular renderer to see what works:
*
* ```markdown
* |                         | A (letter inside) | B (punctuation inside) | C (whitespace inside) | D (nothing inside) |
* | ----------------------- | ----------------- | ---------------------- | --------------------- | ------------------ |
* | 1 (letter outside)      | x*y*z             | x*.*z                  | x* *z                 | x**z               |
* | 2 (punctuation outside) | .*y*.             | .*.*.                  | .* *.                 | .**.               |
* | 3 (whitespace outside)  | x *y* z           | x *.* z                | x * * z               | x ** z             |
* | 4 (nothing outside)     | *x*               | *.*                    | * *                   | **                 |
* ```
*
* @param {number} outside
*   Code point on the outer side of the run.
* @param {number} inside
*   Code point on the inner side of the run.
* @param {string} marker
*   Marker of the run.
*   Underscores are handled more strictly (they form less often) than
*   asterisks.
* @returns {EncodeSides}
*   Whether to encode characters.
*/
function encodeInfo(outside, inside, marker) {
	const outsideKind = classifyCharacter(outside);
	const insideKind = classifyCharacter(inside);
	if (outsideKind === void 0) return insideKind === void 0 ? marker === "_" ? {
		inside: true,
		outside: true
	} : {
		inside: false,
		outside: false
	} : insideKind === 1 ? {
		inside: true,
		outside: true
	} : {
		inside: false,
		outside: true
	};
	if (outsideKind === 1) return insideKind === void 0 ? {
		inside: false,
		outside: false
	} : insideKind === 1 ? {
		inside: true,
		outside: true
	} : {
		inside: false,
		outside: false
	};
	return insideKind === void 0 ? {
		inside: false,
		outside: false
	} : insideKind === 1 ? {
		inside: true,
		outside: false
	} : {
		inside: false,
		outside: false
	};
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/html-kind.js
/**
* @typedef {1 | 2 | 3 | 4 | 5 | 6 | 7} Kind
*   Kind of HTML (flow) element.
*/
/**
* Infer the kind of HTML that `value` is.
*
* This works on valid trees as produced by `micromark`.
* Kinds:
*
* 1. raw
* 2. comment
* 3. instruction
* 4. declaration
* 5. cdata
* 6. block
* 7. other
*
* See: <https://spec.commonmark.org/0.31.2/#html-blocks>.
*
* @param {string} value
*   HTML.
* @returns {Kind | undefined}
*   Kind; `undefined` if unknown.
*/
function htmlKind(value) {
	if (value.charCodeAt(0) !== 60) return;
	const next = value.charCodeAt(1);
	if (next === 33) {
		const code = value.charCodeAt(2);
		if (code === 45) return 2;
		if (code === 91) return 5;
		if (asciiAlpha(code)) return 4;
		return;
	}
	if (next === 63) return 3;
	const closing = next === 47;
	const start = closing ? 2 : 1;
	let end = start;
	let code = value.charCodeAt(end);
	if (!asciiAlpha(code)) return;
	while (code === 45 || asciiAlphanumeric(code)) code = value.charCodeAt(++end);
	const name = value.slice(start, end).toLowerCase();
	if (!closing && code !== 47 && htmlRawNames.includes(name)) return 1;
	return htmlBlockNames.includes(name) ? 6 : 7;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/container-phrasing.js
/**
* @import {Attention, Handle, Info, State, Tracker} from 'mdast-util-to-markdown'
* @import {PhrasingParents} from '../types.js'
*/
/**
* Markers for builtin attention (emphasis, strong) to whether they are stricter:
* whether they cannot open and close inside words.
*
* Builtin runs pair following CommonMark rules for emphasis and strong:
* they are split,
* using one or two markers at a time,
* with the rule of 3.
* Other markers pair like GFM strikethrough:
* whole runs pair with a run of the same size.
*
* @type {Map<string, boolean>}
*/
var builtins = /* @__PURE__ */ new Map([["*", false], ["_", true]]);
/**
* @typedef AttentionResult
*   Attention, of which the sequence is chosen later.
* @property {Array<Item>} children
*   Serialized children.
* @property {Array<string>} sequences
*   Sequences that can be used, in order of preference.
*/
/**
* @typedef Improvement
*   Improvement of attention sequences.
* @property {Map<AttentionResult, string>} chosen
*   Chosen sequences for each attention.
* @property {Array<Token>} tokens
*   Tokens involved in the improvement.
* @property {Mistake | undefined} mistake
*   Mistake that led to this improvement, if any.
*/
/**
* @typedef {AttentionResult | string} Item
*   Serialized phrasing.
*/
/**
* @typedef Mistake
*   Sequence that does not form its attention.
* @property {Array<AttentionResult>} attention
*   Attention to try other sequences for.
* @property {number} index
*   Index of the token.
*/
/**
* @typedef Run
*   Sequences next to each other with the same marker.
* @property {boolean} close
*   Whether it can close.
* @property {number} end
*   Index after the last marker not used (to open).
* @property {Array<Token>} markers
*   Sequence of each marker.
* @property {boolean} open
*   Whether it can open.
* @property {boolean} split
*   Whether it can be split (built-in attention).
* @property {number} start
*   Index of the first marker not used (to close).
* @property {Array<Token>} tokens
*   Sequences.
*/
/**
* @typedef Token
*   Rendered phrasing.
* @property {AttentionResult | undefined} attention
*   Attention, if this is one of its sequences.
* @property {string} value
*   Value.
*/
/**
* Get candidates for a mistake:
* attention to try other sequences for,
* later first.
*
* @param {Array<Token>} tokens
*   Tokens.
* @param {Array<Token>} involved
*   Sequences involved in the mistake.
* @param {Map<Token, Run>} runOf
*   Run of each sequence.
* @returns {Array<AttentionResult>}
*   Candidates.
*/
function candidates(tokens, involved, runOf) {
	/** @type {Set<AttentionResult | undefined>} */
	const related = /* @__PURE__ */ new Set();
	for (const token of tokens) {
		const siblings = runOf.get(token);
		if (siblings && token.attention && involved.some((d) => d.attention === token.attention)) for (const sibling of siblings.tokens) related.add(sibling.attention);
	}
	/** @type {Array<AttentionResult>} */
	const ordered = [];
	for (const token of tokens) if (token.attention && related.delete(token.attention)) ordered.push(token.attention);
	ordered.reverse();
	return ordered;
}
/**
* Check whether sequences form their attention, like `micromark`.
*
* Sequences of `*` and `_` pair like emphasis and strong in CommonMark,
* others like strikethrough in GFM.
*
* @param {Array<Token>} tokens
*   Tokens.
* @param {string} before
*   Characters before.
* @param {string} after
*   Characters after.
* @returns {Mistake | undefined}
*   First mistake, if any.
*/
function check(tokens, before, after) {
	/** @type {Array<Run>} */
	const runs = [];
	/** @type {Map<Token, Array<Token>>} */
	const wrong = /* @__PURE__ */ new Map();
	/** @type {Map<Token, Run>} */
	const runOf = /* @__PURE__ */ new Map();
	let index = 0;
	while (index < tokens.length) {
		if (!tokens[index].attention) {
			index++;
			continue;
		}
		const marker = tokens[index].value.charAt(0);
		const strict = builtins.get(marker);
		let end = index + 1;
		while (end < tokens.length && tokens[end].attention && tokens[end].value.charAt(0) === marker) end++;
		const head = index ? tokens[index - 1].value : before;
		const previous = classifyCharacter(head.charCodeAt(head.length - 1));
		const next = classifyCharacter((end < tokens.length ? tokens[end].value : after).charCodeAt(0));
		const open = !next || next === 2 && Boolean(previous);
		const close = !previous || previous === 2 && Boolean(next);
		/** @type {Run} */
		const run = {
			tokens: tokens.slice(index, end),
			markers: [],
			start: 0,
			end: 0,
			open: strict ? open && (Boolean(previous) || !close) : open,
			close: strict ? close && (Boolean(next) || !open) : close,
			split: strict !== void 0
		};
		for (const token of run.tokens) {
			wrong.set(token, [...run.tokens]);
			runOf.set(token, run);
			let size = token.value.length;
			while (size--) run.markers.push(token);
		}
		run.end = run.markers.length;
		runs.push(run);
		index = end;
	}
	pair(runs, wrong);
	index = -1;
	while (++index < tokens.length) {
		const involved = wrong.get(tokens[index]);
		if (involved) return {
			attention: candidates(tokens, involved, runOf),
			index
		};
	}
}
/**
* Encode the first or last character of tokens as a character reference,
* if it is text.
*
* @param {Array<Token>} tokens
*   Tokens.
* @param {boolean} start
*   Whether to encode the first or last character.
* @returns {undefined}
*   Nothing.
*/
function encode(tokens, start) {
	const token = tokens[start ? 0 : tokens.length - 1];
	if (!token || token.attention) return;
	const character = start ? firstCharacter(token.value) : lastCharacter(token.value);
	const reference = encodeCharacterReference(character.codePointAt(0));
	if (start) token.value = reference + token.value.slice(character.length);
	else {
		let value = token.value.slice(0, token.value.length - character.length);
		let escapes = 0;
		while (value.charCodeAt(value.length - 1 - escapes) === 92) escapes++;
		if (escapes % 2) value += "\\";
		token.value = value + reference;
	}
}
/**
* Try other sequences for the candidates of a mistake and use the first that
* moves the mistake further.
*
* @param {Array<Item>} items
*   Items.
* @param {Map<AttentionResult, string>} chosen
*   Sequences to use instead of preferred sequences.
* @param {Mistake} mistake
*   Mistake.
* @param {string} before
*   Characters before.
* @param {string} after
*   Characters after.
* @returns {Improvement | undefined}
*   Result if better.
*/
function improve(items, chosen, mistake, before, after) {
	for (const attention of mistake.attention) {
		const current = chosen.get(attention) || attention.sequences[0];
		for (const sequence of attention.sequences) {
			if (sequence === current) continue;
			const trial = new Map(chosen);
			trial.set(attention, sequence);
			const tokens = render(items, trial, before, after);
			const next = check(tokens, before, after);
			if (!next || next.index > mistake.index) return {
				chosen: trial,
				mistake: next,
				tokens
			};
		}
	}
}
/**
* Pair runs like `micromark` and mark sequences that do form their attention
* as fine.
*
* Each pair uses markers from the end of an opener and the start of a closer.
* It forms the intended attention if those markers are exactly the whole
* opening and closing sequence of one attention.
* Otherwise attention is mixed up:
* either sequences of different attention pair,
* part of a sequence is used (such as `**` of strong as `*`),
* or several sequences are used together (such as `*` and `*` as `**`).
* Then the sequences involved are recorded with each other.
*
* @param {Array<Run>} runs
*   Runs.
* @param {Map<Token, Array<Token>>} wrong
*   Sequences that are wrong, with the sequences involved.
* @returns {undefined}
*   Nothing, `wrong` is changed.
*/
function pair(runs, wrong) {
	/** @type {Map<string, Array<Run>>} */
	const openersByMarker = /* @__PURE__ */ new Map();
	for (const closer of runs) {
		const marker = closer.tokens[0].value.charAt(0);
		let openers = openersByMarker.get(marker);
		if (!openers) {
			openers = [];
			openersByMarker.set(marker, openers);
		}
		let open = closer.close ? openers.length : 0;
		while (open-- && closer.start < closer.end) {
			const opener = openers[open];
			const openerSize = opener.end - opener.start;
			const closerSize = closer.end - closer.start;
			if (closer.split ? (opener.close || closer.open) && closerSize % 3 && !((openerSize + closerSize) % 3) : openerSize !== opener.markers.length || openerSize !== closerSize) continue;
			const size = closer.split ? openerSize > 1 && closerSize > 1 ? 2 : 1 : closerSize;
			const opening = opener.markers.slice(opener.end - size, opener.end);
			const closing = closer.markers.slice(closer.start, closer.start + size);
			const openToken = opening[0];
			const closeToken = closing[0];
			if (openToken === opening[size - 1] && openToken.value.length === size && closeToken === closing[size - 1] && closeToken.value.length === size && openToken.attention === closeToken.attention) {
				wrong.delete(openToken);
				wrong.delete(closeToken);
			} else {
				const involved = [.../* @__PURE__ */ new Set([...opening, ...closing])];
				for (const token of involved) {
					const list = wrong.get(token);
					if (list) list.push(...involved);
				}
			}
			opener.end -= size;
			closer.start += size;
			if (opener.start === opener.end) openers.splice(open, 1);
			open = openers.length;
		}
		if (closer.open && closer.start < closer.end) openers.push(closer);
	}
}
/**
* Get the sequences that can be used for attention, in order of preference.
*
* @param {string} type
*   Node type.
* @param {Array<string>} markers
*   Markers.
* @param {Array<number>} sizes
*   Sizes.
* @returns {Array<string>}
*   Sequences.
*/
function attentionSequences(type, markers, sizes) {
	if (markers.length === 0) throw new Error("Cannot serialize `" + type + "` as attention without markers, expected one or more markers");
	if (sizes.length === 0) throw new Error("Cannot serialize `" + type + "` as attention without sizes, expected one or more sizes");
	for (const size of sizes) if (!Number.isSafeInteger(size) || size < 1) throw new Error("Cannot serialize `" + type + "` as attention with `" + size + "` as size, expected positive integer");
	/** @type {Array<string>} */
	const sequences = [];
	for (const marker of markers) {
		if (marker.length !== 1) throw new Error("Cannot serialize `" + type + "` as attention with `" + marker + "` as marker, expected a single ascii character");
		if (!asciiPunctuation(marker.charCodeAt(0))) throw new Error("Cannot serialize `" + type + "` as attention with `" + marker + "` as marker, expected ascii punctuation");
		for (const size of sizes) sequences.push(marker.repeat(size));
	}
	return sequences;
}
/**
* Serialize the children of a parent that contains phrasing children,
* keeping attention separate,
* so that its markers can be chosen later.
*
* @param {PhrasingParents} parent
*   Parent of phrasing nodes.
* @param {State} state
*   Info passed around about the current state.
* @param {Info} info
*   Info on where we are in the document we are generating.
* @returns {Array<Item>}
*   Items.
*/
function phrasing(parent, state, info) {
	const indexStack = state.indexStack;
	const children = parent.children || [];
	/** @type {Array<Item>} */
	const results = [];
	let index = -1;
	let before = info.before;
	indexStack.push(-1);
	let tracker = state.createTracker(info);
	while (++index < children.length) {
		const child = children[index];
		/** @type {string} */
		let after;
		indexStack[indexStack.length - 1] = index;
		if (index + 1 < children.length) {
			/** @type {Handle} */
			let handle = state.handle.handlers[children[index + 1].type];
			if (handle && handle.peek) handle = handle.peek;
			after = handle ? firstCharacter(handle(children[index + 1], parent, state, {
				before: "",
				after: "",
				...tracker.current()
			})) : "";
		} else after = info.after;
		const previous = results[results.length - 1];
		if (typeof previous === "string" && (before === "\r" || before === "\n") && child.type === "html" && htmlKind(child.value) !== 7) {
			results[results.length - 1] = previous.replace(/(\r?\n|\r)$/, " ");
			before = " ";
			tracker = state.createTracker(info);
			tracker.move(serialize(results, info.before, info.after));
		}
		/** @type {(Handle & {attention?: Attention | undefined}) | undefined} */
		const handle = state.handle.handlers[child.type];
		if (handle && handle.attention) {
			const item = attentionItem(child, handle.attention, state, tracker);
			results.push(item);
			before = lastCharacter(item.sequences[0]);
		} else {
			const value = state.handle(child, parent, state, {
				...tracker.current(),
				after,
				before
			});
			if (!value) continue;
			tracker.move(value);
			results.push(value);
			before = lastCharacter(value);
		}
	}
	indexStack.pop();
	return results;
}
/**
* Serialize a node as attention,
* with its sequence chosen later.
*
* @param {PhrasingParents} node
*   Node.
* @param {Attention} attention
*   Attention of the node.
* @param {State} state
*   Info passed around about the current state.
* @param {Tracker} tracker
*   Tracker.
* @returns {AttentionResult}
*   Attention.
*/
function attentionItem(node, attention, state, tracker) {
	const { construct, markers, sizes } = attention(node, state);
	const sequences = attentionSequences(node.type, markers, sizes);
	const sequence = sequences[0];
	const exit = state.enter(construct);
	tracker.move(sequence);
	const children = phrasing(node, state, {
		...tracker.current(),
		before: sequence,
		after: sequence
	});
	tracker.move(serialize(children, sequence, sequence));
	tracker.move(sequence);
	exit();
	return {
		children,
		sequences
	};
}
/**
* Render items with sequences;
* encoding characters around attention where needed.
*
* @param {Array<Item>} items
*   Serialized phrasing.
* @param {Map<AttentionResult, string>} chosen
*   Sequences to use instead of preferred sequences.
* @param {string} before
*   Characters before.
* @param {string} after
*   Characters after.
* @returns {Array<Token>}
*   Tokens.
*/
function render(items, chosen, before, after) {
	/** @type {Array<Token>} */
	const tokens = [];
	/** @type {string | undefined} */
	let encodeAfter;
	let previous = lastCharacter(before);
	let index = -1;
	while (++index < items.length) {
		const item = items[index];
		if (typeof item === "string") {
			/** @type {Token} */
			const token = {
				value: item,
				attention: void 0
			};
			if (encodeAfter && encodeAfter === firstCharacter(item)) encode([token], true);
			encodeAfter = void 0;
			tokens.push(token);
			if (token.value) previous = lastCharacter(token.value);
			continue;
		}
		const sequence = chosen.get(item) || item.sequences[0];
		const marker = sequence.charAt(0);
		const next = items[index + 1];
		const outsideBefore = previous;
		const outsideAfter = firstCharacter(next === void 0 ? after : typeof next === "string" ? next : chosen.get(next) || next.sequences[0]);
		const inside = render(item.children, chosen, sequence, sequence);
		const head = inside.length > 0 ? inside[0].value : "";
		const open = encodeInfo(outsideBefore.charCodeAt(outsideBefore.length - 1), head.charCodeAt(0), marker);
		if (open.inside) encode(inside, true);
		const tail = inside.length > 0 ? lastCharacter(inside[inside.length - 1].value) : "";
		const close = encodeInfo(outsideAfter.charCodeAt(0), tail.charCodeAt(tail.length - 1), marker);
		if (close.inside) encode(inside, false);
		if (open.outside && outsideBefore !== "\n" && outsideBefore !== "\r") encode(tokens, false);
		if (close.outside) encodeAfter = outsideAfter;
		tokens.push({
			value: sequence,
			attention: item
		}, ...inside, {
			value: sequence,
			attention: item
		});
		previous = sequence.charAt(sequence.length - 1);
	}
	return tokens;
}
/**
* Serialize phrasing with attention.
*
* Whether attention forms depends on everything around it.
* This checks that it does and tries other sequences if not.
*
* @param {Array<Item>} items
*   Phrasing items.
* @param {string} before
*   Characters before.
* @param {string} after
*   Characters after.
* @returns {string}
*   Serialized markdown.
*/
function serialize(items, before, after) {
	/** @type {Map<AttentionResult, string>} */
	let chosen = /* @__PURE__ */ new Map();
	const initial = render(items, chosen, before, after);
	let tokens = initial;
	let mistake = check(tokens, before, after);
	while (mistake) {
		const next = improve(items, chosen, mistake, before, after);
		if (!next) {
			tokens = initial;
			break;
		}
		chosen = next.chosen;
		tokens = next.tokens;
		mistake = next.mistake;
	}
	let result = "";
	for (const token of tokens) result += token.value;
	return result;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/emphasis.js
/**
* @import {AttentionInfo, Info, State} from 'mdast-util-to-markdown'
* @import {Emphasis, Parents} from 'mdast'
*/
emphasis.attention = attention$1;
emphasis.peek = peek$1;
/**
* Serialize an emphasis node.
*
* Attention is properly handled by `containerPhrasing`.
*
* @param {Emphasis} node
*   Node to serialize.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function emphasis(node, _, state, info) {
	const exit = state.enter("phrasing");
	const value = serialize([attentionItem(node, attention$1, state, state.createTracker(info))], info.before, info.after);
	exit();
	return value;
}
/**
* Serialize an emphasis node as attention.
*
* @param {Emphasis} _
*   Node to serialize.
* @param {State} state
*   Info passed around.
* @returns {AttentionInfo}
*   Info on how to serialize the node.
*/
function attention$1(_, state) {
	return {
		construct: "emphasis",
		markers: checkEmphasis(state) === "*" ? ["*", "_"] : ["_", "*"],
		sizes: [1]
	};
}
/**
* Peek at this node.
*
* @param {Emphasis} _
*   Node to serialize.
* @param {Parents | undefined} _1
*   Parent node.
* @param {State} state
*   Info passed around.
* @returns {string}
*   Start of the serialized markdown.
*/
function peek$1(_, _1, state) {
	return state.options.emphasis || "*";
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/format-heading-as-setext.js
/**
* @import {State} from 'mdast-util-to-markdown'
* @import {Heading} from 'mdast'
*/
/**
* Checks if a heading can be formatted as a setext heading.
*
* @param {Heading} node
*   Node to check.
* @param {State} state
*   Info passed around.
* @returns {boolean}
*   Whether the heading can be formatted as a setext heading.
*/
function formatHeadingAsSetext(node, state) {
	let literalWithBreak = false;
	visit(node, function(node) {
		if ("value" in node && /\r?\n|\r/.test(node.value) || node.type === "break") {
			literalWithBreak = true;
			return false;
		}
	});
	return Boolean((!node.depth || node.depth < 3) && toString(node) && (state.options.setext || literalWithBreak));
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/heading.js
/**
* @import {Info, State} from 'mdast-util-to-markdown'
* @import {Heading, Parents} from 'mdast'
*/
/**
* Serialize a heading node.
*
* @param {Heading} node
*   Node to serialize.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function heading(node, _, state, info) {
	const rank = Math.max(Math.min(6, node.depth || 1), 1);
	const tracker = state.createTracker(info);
	if (formatHeadingAsSetext(node, state)) {
		const exit = state.enter("headingSetext");
		const subexit = state.enter("phrasing");
		const value = state.containerPhrasing(node, {
			...tracker.current(),
			before: "\n",
			after: "\n"
		});
		subexit();
		exit();
		return value + "\n" + (rank === 1 ? "=" : "-").repeat(value.length - (Math.max(value.lastIndexOf("\r"), value.lastIndexOf("\n")) + 1));
	}
	const sequence = "#".repeat(rank);
	const exit = state.enter("headingAtx");
	const subexit = state.enter("phrasing");
	tracker.move(sequence + " ");
	let value = state.containerPhrasing(node, {
		before: "# ",
		after: "\n",
		...tracker.current()
	});
	const head = value.charCodeAt(0);
	if (head === 9 || head === 32) value = encodeCharacterReference(head) + value.slice(1);
	value = value ? sequence + " " + value : sequence;
	if (state.options.closeAtx) value += " " + sequence;
	subexit();
	exit();
	return value;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/html.js
/**
* @import {Html} from 'mdast'
*/
html.peek = htmlPeek;
/**
* Serialize an HTML node.
*
* @param {Html} node
*   Node to serialize.
* @returns {string}
*   Serialized markdown.
*/
function html(node) {
	return node.value || "";
}
/**
* Peek at this node.
*
* @returns {string}
*   Start of the serialized markdown.
*/
function htmlPeek() {
	return "<";
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/image.js
/**
* @import {Info, State} from 'mdast-util-to-markdown'
* @import {Image, Parents} from 'mdast'
*/
image.peek = imagePeek;
/**
* Serialize an image node.
*
* @param {Image} node
*   Node to serialize.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function image(node, _, state, info) {
	const quote = checkQuote(state);
	const suffix = quote === "\"" ? "Quote" : "Apostrophe";
	const exit = state.enter("image");
	let subexit = state.enter("label");
	const tracker = state.createTracker(info);
	let value = tracker.move("![");
	value += tracker.move(state.safe(node.alt, {
		before: value,
		after: "]",
		...tracker.current()
	}));
	value += tracker.move("](");
	subexit();
	if (!node.url && node.title || /[\0- \u007F]/.test(node.url)) {
		subexit = state.enter("destinationLiteral");
		value += tracker.move("<");
		value += tracker.move(state.safe(node.url, {
			before: value,
			after: ">",
			...tracker.current()
		}));
		value += tracker.move(">");
	} else {
		subexit = state.enter("destinationRaw");
		value += tracker.move(state.safe(node.url, {
			before: value,
			after: node.title ? " " : ")",
			...tracker.current()
		}));
	}
	subexit();
	if (node.title) {
		subexit = state.enter(`title${suffix}`);
		value += tracker.move(" " + quote);
		value += tracker.move(state.safe(node.title, {
			before: value,
			after: quote,
			...tracker.current()
		}));
		value += tracker.move(quote);
		subexit();
	}
	value += tracker.move(")");
	exit();
	return value;
}
/**
* Peek at this node.
*
* @returns {string}
*   Start of the serialized markdown.
*/
function imagePeek() {
	return "!";
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/image-reference.js
/**
* @import {Info, State} from 'mdast-util-to-markdown'
* @import {ImageReference, Parents} from 'mdast'
*/
imageReference.peek = imageReferencePeek;
/**
* Serialize an image reference node.
*
* @param {ImageReference} node
*   Node to serialize.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function imageReference(node, _, state, info) {
	const type = node.referenceType;
	const exit = state.enter("imageReference");
	let subexit = state.enter("label");
	const tracker = state.createTracker(info);
	let value = tracker.move("![");
	const alt = state.safe(node.alt, {
		before: value,
		after: "]",
		...tracker.current()
	});
	value += tracker.move(alt + "][");
	subexit();
	const stack = state.stack;
	state.stack = stack.filter(function(d) {
		return d !== "phrasing";
	});
	subexit = state.enter("reference");
	const reference = state.safe(state.associationId(node), {
		before: value,
		after: "]",
		...tracker.current()
	});
	subexit();
	state.stack = stack;
	exit();
	if (type === "full" || !alt || alt !== reference) value += tracker.move(reference + "]");
	else if (type === "shortcut") value = value.slice(0, -1);
	else value += tracker.move("]");
	return value;
}
/**
* Peek at this node.
*
* @returns {string}
*   Start of the serialized markdown.
*/
function imageReferencePeek() {
	return "!";
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/inline-code.js
/**
* @import {State} from 'mdast-util-to-markdown'
* @import {InlineCode, Parents} from 'mdast'
*/
inlineCode.peek = inlineCodePeek;
/**
* Serialize an inline code node.
*
* @param {InlineCode} node
*   Node to serialize.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @returns {string}
*   Serialized markdown.
*/
function inlineCode(node, _, state) {
	let value = node.value || "";
	let sequence = "`";
	let index = -1;
	while (new RegExp("(^|[^`])" + sequence + "([^`]|$)").test(value)) sequence += "`";
	if (/[^\n\r ]/.test(value) && (/^[\n\r ]/.test(value) && /[\n\r ]$/.test(value) || /^`|`$/.test(value))) value = " " + value + " ";
	while (++index < state.unsafe.length) {
		const pattern = state.unsafe[index];
		const expression = state.compilePattern(pattern);
		if (!pattern.atBreak) continue;
		/** @type {RegExpExecArray | null} */
		let match;
		while (match = expression.exec(value)) {
			let position = match.index;
			if (value.charCodeAt(position) === 10 && value.charCodeAt(position - 1) === 13) position--;
			value = value.slice(0, position) + " " + value.slice(match.index + 1);
		}
	}
	return sequence + value + sequence;
}
/**
* Peek at this node.
*
* @returns {string}
*   Start of the serialized markdown.
*/
function inlineCodePeek() {
	return "`";
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/format-link-as-autolink.js
/**
* @import {State} from 'mdast-util-to-markdown'
* @import {Link} from 'mdast'
*/
/**
* Checks if a link can be formatted as an autolink.
*
* @param {Link} node
*   Node to check.
* @param {State} state
*   Info passed around.
* @returns {boolean}
*   Whether the link can be formatted as an autolink.
*/
function formatLinkAsAutolink(node, state) {
	const raw = toString(node);
	return Boolean(!state.options.resourceLink && node.url && !node.title && node.children && node.children.length === 1 && node.children[0].type === "text" && (raw === node.url || "mailto:" + raw === node.url) && /^[a-z][+\-.a-z]+:/i.test(node.url) && !/[\0- <>\u007F]/.test(node.url));
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/link.js
/**
* @import {Info, State} from 'mdast-util-to-markdown'
* @import {Link, Parents} from 'mdast'
* @import {Exit} from '../types.js'
*/
link.peek = linkPeek;
/**
* Serialize a link node.
*
* @param {Link} node
*   Node to serialize.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function link(node, _, state, info) {
	const quote = checkQuote(state);
	const suffix = quote === "\"" ? "Quote" : "Apostrophe";
	const tracker = state.createTracker(info);
	if (formatLinkAsAutolink(node, state)) {
		const stack = state.stack;
		state.stack = stack.filter(function(d) {
			return d !== "phrasing";
		});
		const exit = state.enter("autolink");
		let value = tracker.move("<");
		value += tracker.move(state.containerPhrasing(node, {
			before: value,
			after: ">",
			...tracker.current()
		}));
		value += tracker.move(">");
		exit();
		state.stack = stack;
		return value;
	}
	const exit = state.enter("link");
	let subexit = state.enter("label");
	let value = tracker.move("[");
	const text = state.containerPhrasing(node, {
		before: value,
		after: "](",
		...tracker.current()
	});
	value += tracker.move(text);
	subexit();
	value += tracker.move("](");
	const enclose = /[\0- \u007F]/.test(node.url);
	const last = info.before.charAt(info.before.length - 1);
	let title = node.title || void 0;
	if (!title && !enclose && (last === "\n" || last === "\r")) {
		let index = 0;
		while (index < text.length && text.charCodeAt(index) !== 93) index += text.charCodeAt(index) === 92 ? 2 : 1;
		if (text.charCodeAt(index + 1) === 58) title = "";
	}
	if (!node.url && typeof title === "string" || enclose) {
		subexit = state.enter("destinationLiteral");
		value += tracker.move("<");
		value += tracker.move(state.safe(node.url, {
			before: value,
			after: ">",
			...tracker.current()
		}));
		value += tracker.move(">");
	} else {
		subexit = state.enter("destinationRaw");
		value += tracker.move(state.safe(node.url, {
			before: value,
			after: typeof title === "string" ? " " : ")",
			...tracker.current()
		}));
	}
	subexit();
	if (typeof title === "string") {
		subexit = state.enter(`title${suffix}`);
		value += tracker.move(" " + quote);
		value += tracker.move(state.safe(title, {
			before: value,
			after: quote,
			...tracker.current()
		}));
		value += tracker.move(quote);
		subexit();
	}
	value += tracker.move(")");
	exit();
	return value;
}
/**
* Peek at this node.
*
* @param {Link} node
*   Node to peek at.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @returns {string}
*   Start of the serialized markdown.
*/
function linkPeek(node, _, state) {
	return formatLinkAsAutolink(node, state) ? "<" : "[";
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/link-reference.js
/**
* @import {Info, State} from 'mdast-util-to-markdown'
* @import {LinkReference, Parents} from 'mdast'
*/
linkReference.peek = linkReferencePeek;
/**
* Serialize a link reference node.
*
* @param {LinkReference} node
*   Node to serialize.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function linkReference(node, _, state, info) {
	const type = node.referenceType;
	const exit = state.enter("linkReference");
	let subexit = state.enter("label");
	const tracker = state.createTracker(info);
	let value = tracker.move("[");
	const text = state.containerPhrasing(node, {
		before: value,
		after: "]",
		...tracker.current()
	});
	value += tracker.move(text + "][");
	subexit();
	const stack = state.stack;
	state.stack = stack.filter(function(d) {
		return d !== "phrasing";
	});
	subexit = state.enter("reference");
	const reference = state.safe(state.associationId(node), {
		before: value,
		after: "]",
		...tracker.current()
	});
	subexit();
	state.stack = stack;
	exit();
	if (type === "full" || !text || text !== reference) value += tracker.move(reference + "]");
	else if (type === "shortcut") value = value.slice(0, -1);
	else value += tracker.move("]");
	return value;
}
/**
* Peek at this node.
*
* @returns {string}
*   Start of the serialized markdown.
*/
function linkReferencePeek() {
	return "[";
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/check-bullet.js
/**
* @import {Options, State} from 'mdast-util-to-markdown'
*/
/**
* Checks the preferred list bullet option.
*
* @param {State} state
*   Info passed around.
* @returns {Exclude<Options['bullet'], null | undefined>}
*   Preferred list bullet.
*/
function checkBullet(state) {
	const marker = state.options.bullet || "*";
	if (marker !== "*" && marker !== "+" && marker !== "-") throw new Error("Cannot serialize items with `" + marker + "` for `options.bullet`, expected `*`, `+`, or `-`");
	return marker;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/check-bullet-other.js
/**
* @import {Options, State} from 'mdast-util-to-markdown'
*/
/**
* Checks the preferred alternate list bullet option.
*
* @param {State} state
*   Info passed around.
* @returns {Exclude<Options['bullet'], null | undefined>}
*   Preferred alternate list bullet.
*/
function checkBulletOther(state) {
	const bullet = checkBullet(state);
	const bulletOther = state.options.bulletOther;
	if (!bulletOther) return bullet === "*" ? "-" : "*";
	if (bulletOther !== "*" && bulletOther !== "+" && bulletOther !== "-") throw new Error("Cannot serialize items with `" + bulletOther + "` for `options.bulletOther`, expected `*`, `+`, or `-`");
	if (bulletOther === bullet) throw new Error("Expected `bullet` (`" + bullet + "`) and `bulletOther` (`" + bulletOther + "`) to be different");
	return bulletOther;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/check-bullet-ordered.js
/**
* @import {Options, State} from 'mdast-util-to-markdown'
*/
/**
* Checks the preferred ordered list bullet option.
*
* @param {State} state
*   Info passed around.
* @returns {Exclude<Options['bulletOrdered'], null | undefined>}
*   Preferred ordered list bullet.
*/
function checkBulletOrdered(state) {
	const marker = state.options.bulletOrdered || ".";
	if (marker !== "." && marker !== ")") throw new Error("Cannot serialize items with `" + marker + "` for `options.bulletOrdered`, expected `.` or `)`");
	return marker;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/check-rule.js
/**
* @import {Options, State} from 'mdast-util-to-markdown'
*/
/**
* Checks the preferred rule option.
*
* @param {State} state
*   Info passed around.
* @returns {Exclude<Options['rule'], null | undefined>}
*   Preferred rule marker.
*/
function checkRule(state) {
	const marker = state.options.rule || "*";
	if (marker !== "*" && marker !== "-" && marker !== "_") throw new Error("Cannot serialize rules with `" + marker + "` for `options.rule`, expected `*`, `-`, or `_`");
	return marker;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/list.js
/**
* @import {Info, State} from 'mdast-util-to-markdown'
* @import {List, Parents} from 'mdast'
*/
/**
* Serialize a list node.
*
* @param {List} node
*   Node to serialize.
* @param {Parents | undefined} parent
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function list(node, parent, state, info) {
	const exit = state.enter("list");
	const bulletCurrent = state.bulletCurrent;
	/** @type {string} */
	let bullet = node.ordered ? checkBulletOrdered(state) : checkBullet(state);
	/** @type {string} */
	const bulletOther = node.ordered ? bullet === "." ? ")" : "." : checkBulletOther(state);
	let useDifferentMarker = parent && state.bulletLastUsed ? bullet === state.bulletLastUsed : false;
	if (!node.ordered) {
		const firstListItem = node.children ? node.children[0] : void 0;
		if ((bullet === "*" || bullet === "-") && firstListItem && (!firstListItem.children || !firstListItem.children[0]) && state.stack[state.stack.length - 1] === "list" && state.stack[state.stack.length - 2] === "listItem" && state.stack[state.stack.length - 3] === "list" && state.stack[state.stack.length - 4] === "listItem" && state.indexStack[state.indexStack.length - 1] === 0 && state.indexStack[state.indexStack.length - 2] === 0 && state.indexStack[state.indexStack.length - 3] === 0) useDifferentMarker = true;
		if (checkRule(state) === bullet && firstListItem) {
			let index = -1;
			while (++index < node.children.length) {
				const item = node.children[index];
				if (item && item.type === "listItem" && item.children && item.children[0] && item.children[0].type === "thematicBreak") {
					useDifferentMarker = true;
					break;
				}
			}
		}
	}
	if (useDifferentMarker) bullet = bulletOther;
	state.bulletCurrent = bullet;
	const value = state.containerFlow(node, info);
	state.bulletLastUsed = bullet;
	state.bulletCurrent = bulletCurrent;
	exit();
	return value;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/check-list-item-indent.js
/**
* @import {Options, State} from 'mdast-util-to-markdown'
*/
/**
* Checks the preferred list item indent option.
*
* @param {State} state
*   Info passed around.
* @returns {Exclude<Options['listItemIndent'], null | undefined>}
*   Preferred list item indent.
*/
function checkListItemIndent(state) {
	const style = state.options.listItemIndent || "one";
	if (style !== "tab" && style !== "one" && style !== "mixed") throw new Error("Cannot serialize items with `" + style + "` for `options.listItemIndent`, expected `tab`, `one`, or `mixed`");
	return style;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/list-item.js
/**
* @import {Info, Map, State} from 'mdast-util-to-markdown'
* @import {ListItem, Parents} from 'mdast'
*/
/**
* Serialize a list item node.
*
* @param {ListItem} node
*   Node to serialize.
* @param {Parents | undefined} parent
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function listItem(node, parent, state, info) {
	const listItemIndent = checkListItemIndent(state);
	let bullet = state.bulletCurrent || checkBullet(state);
	if (parent && parent.type === "list" && parent.ordered) bullet = (typeof parent.start === "number" && parent.start > -1 ? parent.start : 1) + (state.options.incrementListMarker === false ? 0 : parent.children.indexOf(node)) + bullet;
	let size = bullet.length + 1;
	if (listItemIndent === "tab" || listItemIndent === "mixed" && (parent && parent.type === "list" && parent.spread || node.spread)) size = Math.ceil(size / 4) * 4;
	const tracker = state.createTracker(info);
	tracker.move(bullet + " ".repeat(size - bullet.length));
	tracker.shift(size);
	const exit = state.enter("listItem");
	const value = state.indentLines(state.containerFlow(node, tracker.current()), map);
	exit();
	return value;
	/**
	* Indent lines of the list item.
	*
	* @type {Map}
	*/
	function map(line, index, blank) {
		if (index) return (blank ? "" : " ".repeat(size)) + line;
		return (blank ? bullet : bullet + " ".repeat(size - bullet.length)) + line;
	}
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/paragraph.js
/**
* @import {Info, State} from 'mdast-util-to-markdown'
* @import {Paragraph, Parents} from 'mdast'
*/
/**
* Serialize a paragraph node.
*
* @param {Paragraph} node
*   Node to serialize.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function paragraph(node, _, state, info) {
	const exit = state.enter("paragraph");
	const subexit = state.enter("phrasing");
	const value = state.containerPhrasing(node, info);
	subexit();
	exit();
	return value;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/root.js
/**
* @import {Info, State} from 'mdast-util-to-markdown'
* @import {Parents, Root} from 'mdast'
*/
/**
* Serialize a root node.
*
* @param {Root} node
*   Node to serialize.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function root(node, _, state, info) {
	if (!node.children.some(function(d) {
		return phrasing$1(d);
	})) return state.containerFlow(node, info);
	const exit = state.enter("phrasing");
	const value = state.containerPhrasing(node, info);
	exit();
	return value;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/check-strong.js
/**
* @import {Options, State} from 'mdast-util-to-markdown'
*/
/**
* Checks the preferred strong option.
*
* @param {State} state
*   Info passed around.
* @returns {Exclude<Options['strong'], null | undefined>}
*   Preferred strong marker.
*/
function checkStrong(state) {
	const marker = state.options.strong || "*";
	if (marker !== "*" && marker !== "_") throw new Error("Cannot serialize strong with `" + marker + "` for `options.strong`, expected `*`, or `_`");
	return marker;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/strong.js
/**
* @import {AttentionInfo, Info, State} from 'mdast-util-to-markdown'
* @import {Parents, Strong} from 'mdast'
*/
strong.attention = attention;
strong.peek = peek;
/**
* Serialize a strong node.
*
* Attention is properly handled by `containerPhrasing`.
*
* @param {Strong} node
*   Node to serialize.
* @param {Parents | undefined} _
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function strong(node, _, state, info) {
	const exit = state.enter("phrasing");
	const value = serialize([attentionItem(node, attention, state, state.createTracker(info))], info.before, info.after);
	exit();
	return value;
}
/**
* Serialize a strong node as attention.
*
* @param {Strong} _
*   Node to serialize.
* @param {State} state
*   Info passed around.
* @returns {AttentionInfo}
*   Info on how to serialize the node.
*/
function attention(_, state) {
	return {
		construct: "strong",
		markers: checkStrong(state) === "*" ? ["*", "_"] : ["_", "*"],
		sizes: [2]
	};
}
/**
* Peek at this node.
*
* @param {Strong} _
*   Node to serialize.
* @param {Parents | undefined} _1
*   Parent node.
* @param {State} state
*   Info passed around.
* @returns {string}
*   Start of the serialized markdown.
*/
function peek(_, _1, state) {
	return state.options.strong || "*";
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/text.js
/**
* @import {Info, State} from 'mdast-util-to-markdown'
* @import {Parents, Text} from 'mdast'
*/
/**
* Serialize a text node.
*
* @param {Text} node
*   Node to serialize.
* @param {Parents | undefined} parent
*   Parent node.
* @param {State} state
*   Info passed around.
* @param {Info} info
*   Info on surrounding context.
* @returns {string}
*   Serialized markdown.
*/
function text(node, parent, state, info) {
	/* c8 ignore next -- parent always passed */
	const siblings = parent ? parent.children : [];
	const index = state.indexStack[state.indexStack.length - 1];
	return state.safe(node.value, {
		...info,
		afterNode: siblings[index + 1],
		beforeNode: siblings[index - 1]
	});
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/util/check-rule-repetition.js
/**
* @import {Options, State} from 'mdast-util-to-markdown'
*/
/**
* Checks the preferred rule repetition option.
*
* @param {State} state
*   Info passed around.
* @returns {Exclude<Options['ruleRepetition'], null | undefined>}
*   Preferred rule repetition.
*/
function checkRuleRepetition(state) {
	const repetition = state.options.ruleRepetition || 3;
	if (repetition < 3) throw new Error("Cannot serialize rules with repetition `" + repetition + "` for `options.ruleRepetition`, expected `3` or more");
	return repetition;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/thematic-break.js
/**
* @import {State} from 'mdast-util-to-markdown'
* @import {Parents, ThematicBreak} from 'mdast'
*/
/**
* Serialize a thematic break node.
*
* @param {ThematicBreak} _
*   Node to serialize.
* @param {Parents | undefined} _1
*   Parent node.
* @param {State} state
*   Info passed around.
* @returns {string}
*   Serialized markdown.
*/
function thematicBreak(_, _1, state) {
	const value = (checkRule(state) + (state.options.ruleSpaces ? " " : "")).repeat(checkRuleRepetition(state));
	return state.options.ruleSpaces ? value.slice(0, -1) : value;
}
//#endregion
//#region node_modules/mdast-util-to-markdown/lib/handle/index.js
/**
* Default (CommonMark) handlers.
*/
var handle = {
	blockquote,
	break: hardBreak,
	code,
	definition,
	emphasis,
	hardBreak,
	heading,
	html,
	image,
	imageReference,
	inlineCode,
	link,
	linkReference,
	list,
	listItem,
	paragraph,
	root,
	strong,
	text,
	thematicBreak
};
//#endregion
//#region node_modules/mdast-util-gfm-table/lib/index.js
/**
* @typedef {import('mdast').InlineCode} InlineCode
* @typedef {import('mdast').Table} Table
* @typedef {import('mdast').TableCell} TableCell
* @typedef {import('mdast').TableRow} TableRow
*
* @typedef {import('markdown-table').Options} MarkdownTableOptions
*
* @typedef {import('mdast-util-from-markdown').CompileContext} CompileContext
* @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
* @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
*
* @typedef {import('mdast-util-to-markdown').Options} ToMarkdownExtension
* @typedef {import('mdast-util-to-markdown').Handle} ToMarkdownHandle
* @typedef {import('mdast-util-to-markdown').State} State
* @typedef {import('mdast-util-to-markdown').Info} Info
*/
/**
* @typedef Options
*   Configuration.
* @property {boolean | null | undefined} [tableCellPadding=true]
*   Whether to add a space of padding between delimiters and cells (default:
*   `true`).
* @property {boolean | null | undefined} [tablePipeAlign=true]
*   Whether to align the delimiters (default: `true`).
* @property {MarkdownTableOptions['stringLength'] | null | undefined} [stringLength]
*   Function to detect the length of table cell content, used when aligning
*   the delimiters between cells (optional).
*/
/**
* Create an extension for `mdast-util-from-markdown` to enable GFM tables in
* markdown.
*
* @returns {FromMarkdownExtension}
*   Extension for `mdast-util-from-markdown` to enable GFM tables.
*/
function gfmTableFromMarkdown() {
	return {
		enter: {
			table: enterTable,
			tableData: enterCell,
			tableHeader: enterCell,
			tableRow: enterRow
		},
		exit: {
			codeText: exitCodeText,
			table: exitTable,
			tableData: exit,
			tableHeader: exit,
			tableRow: exit
		}
	};
}
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function enterTable(token) {
	const align = token._align;
	this.enter({
		type: "table",
		align: align.map(function(d) {
			return d === "none" ? null : d;
		}),
		children: []
	}, token);
	this.data.inTable = true;
}
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function exitTable(token) {
	this.exit(token);
	this.data.inTable = void 0;
}
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function enterRow(token) {
	this.enter({
		type: "tableRow",
		children: []
	}, token);
}
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function exit(token) {
	this.exit(token);
}
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function enterCell(token) {
	this.enter({
		type: "tableCell",
		children: []
	}, token);
}
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function exitCodeText(token) {
	let value = this.resume();
	if (this.data.inTable) value = value.replace(/\\([\\|])/g, replace);
	const node = this.stack[this.stack.length - 1];
	node.type;
	node.value = value;
	this.exit(token);
}
/**
* @param {string} $0
* @param {string} $1
* @returns {string}
*/
function replace($0, $1) {
	return $1 === "|" ? $1 : $0;
}
/**
* Create an extension for `mdast-util-to-markdown` to enable GFM tables in
* markdown.
*
* @param {Options | null | undefined} [options]
*   Configuration.
* @returns {ToMarkdownExtension}
*   Extension for `mdast-util-to-markdown` to enable GFM tables.
*/
function gfmTableToMarkdown(options) {
	const settings = options || {};
	const padding = settings.tableCellPadding;
	const alignDelimiters = settings.tablePipeAlign;
	const stringLength = settings.stringLength;
	const around = padding ? " " : "|";
	return {
		unsafe: [
			{
				character: "\r",
				inConstruct: "tableCell"
			},
			{
				character: "\n",
				inConstruct: "tableCell"
			},
			{
				atBreak: true,
				character: "|",
				after: "[	 :-]"
			},
			{
				character: "|",
				inConstruct: "tableCell"
			},
			{
				atBreak: true,
				character: ":",
				after: "-"
			},
			{
				atBreak: true,
				character: "-",
				after: "[:|-]"
			}
		],
		handlers: {
			inlineCode: inlineCodeWithTable,
			table: handleTable,
			tableCell: handleTableCell,
			tableRow: handleTableRow
		}
	};
	/**
	* @type {ToMarkdownHandle}
	* @param {Table} node
	*/
	function handleTable(node, _, state, info) {
		return serializeData(handleTableAsData(node, state, info), node.align);
	}
	/**
	* This function isn’t really used normally, because we handle rows at the
	* table level.
	* But, if someone passes in a table row, this ensures we make somewhat sense.
	*
	* @type {ToMarkdownHandle}
	* @param {TableRow} node
	*/
	function handleTableRow(node, _, state, info) {
		const value = serializeData([handleTableRowAsData(node, state, info)]);
		return value.slice(0, value.indexOf("\n"));
	}
	/**
	* @type {ToMarkdownHandle}
	* @param {TableCell} node
	*/
	function handleTableCell(node, _, state, info) {
		const exit = state.enter("tableCell");
		const subexit = state.enter("phrasing");
		const value = state.containerPhrasing(node, {
			...info,
			before: around,
			after: around
		});
		subexit();
		exit();
		return value;
	}
	/**
	* @param {Array<Array<string>>} matrix
	* @param {Array<string | null | undefined> | null | undefined} [align]
	*/
	function serializeData(matrix, align) {
		return markdownTable(matrix, {
			align,
			alignDelimiters,
			padding,
			stringLength
		});
	}
	/**
	* @param {Table} node
	* @param {State} state
	* @param {Info} info
	*/
	function handleTableAsData(node, state, info) {
		const children = node.children;
		let index = -1;
		/** @type {Array<Array<string>>} */
		const result = [];
		const subexit = state.enter("table");
		while (++index < children.length) result[index] = handleTableRowAsData(children[index], state, info);
		subexit();
		return result;
	}
	/**
	* @param {TableRow} node
	* @param {State} state
	* @param {Info} info
	*/
	function handleTableRowAsData(node, state, info) {
		const children = node.children;
		let index = -1;
		/** @type {Array<string>} */
		const result = [];
		const subexit = state.enter("tableRow");
		while (++index < children.length) result[index] = handleTableCell(children[index], node, state, info);
		subexit();
		return result;
	}
	/**
	* @type {ToMarkdownHandle}
	* @param {InlineCode} node
	*/
	function inlineCodeWithTable(node, parent, state) {
		let value = handle.inlineCode(node, parent, state);
		if (state.stack.includes("tableCell")) value = value.replace(/\|/g, "\\$&");
		return value;
	}
}
//#endregion
//#region node_modules/mdast-util-gfm-task-list-item/lib/index.js
/**
* @typedef {import('mdast').ListItem} ListItem
* @typedef {import('mdast').Paragraph} Paragraph
* @typedef {import('mdast-util-from-markdown').CompileContext} CompileContext
* @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
* @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
* @typedef {import('mdast-util-to-markdown').Options} ToMarkdownExtension
* @typedef {import('mdast-util-to-markdown').Handle} ToMarkdownHandle
*/
/**
* Create an extension for `mdast-util-from-markdown` to enable GFM task
* list items in markdown.
*
* @returns {FromMarkdownExtension}
*   Extension for `mdast-util-from-markdown` to enable GFM task list items.
*/
function gfmTaskListItemFromMarkdown() {
	return { exit: {
		taskListCheckValueChecked: exitCheck,
		taskListCheckValueUnchecked: exitCheck,
		paragraph: exitParagraphWithTaskListItem
	} };
}
/**
* Create an extension for `mdast-util-to-markdown` to enable GFM task list
* items in markdown.
*
* @returns {ToMarkdownExtension}
*   Extension for `mdast-util-to-markdown` to enable GFM task list items.
*/
function gfmTaskListItemToMarkdown() {
	return {
		unsafe: [{
			atBreak: true,
			character: "-",
			after: "[:|-]"
		}],
		handlers: { listItem: listItemWithTaskListItem }
	};
}
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function exitCheck(token) {
	const node = this.stack[this.stack.length - 2];
	node.type;
	node.checked = token.type === "taskListCheckValueChecked";
}
/**
* @this {CompileContext}
* @type {FromMarkdownHandle}
*/
function exitParagraphWithTaskListItem(token) {
	const parent = this.stack[this.stack.length - 2];
	if (parent && parent.type === "listItem" && typeof parent.checked === "boolean") {
		const node = this.stack[this.stack.length - 1];
		node.type;
		const head = node.children[0];
		if (head && head.type === "text") {
			const siblings = parent.children;
			let index = -1;
			/** @type {Paragraph | undefined} */
			let firstParaghraph;
			while (++index < siblings.length) {
				const sibling = siblings[index];
				if (sibling.type === "paragraph") {
					firstParaghraph = sibling;
					break;
				}
			}
			if (firstParaghraph === node) {
				head.value = head.value.slice(1);
				if (head.value.length === 0) node.children.shift();
				else if (node.position && head.position && typeof head.position.start.offset === "number") {
					head.position.start.column++;
					head.position.start.offset++;
					node.position.start = Object.assign({}, head.position.start);
				}
			}
		}
	}
	this.exit(token);
}
/**
* @type {ToMarkdownHandle}
* @param {ListItem} node
*/
function listItemWithTaskListItem(node, parent, state, info) {
	const head = node.children[0];
	const checkable = typeof node.checked === "boolean" && head && head.type === "paragraph";
	const checkbox = "[" + (node.checked ? "x" : " ") + "] ";
	const tracker = state.createTracker(info);
	if (checkable) tracker.move(checkbox);
	let value = handle.listItem(node, parent, state, {
		...info,
		...tracker.current()
	});
	if (checkable) value = value.replace(/^(?:[*+-]|\d+\.)([\r\n]| {1,3})/, check);
	return value;
	/**
	* @param {string} $0
	* @returns {string}
	*/
	function check($0) {
		return $0 + checkbox;
	}
}
//#endregion
//#region node_modules/mdast-util-gfm/lib/index.js
/**
* @import {Extension as FromMarkdownExtension} from 'mdast-util-from-markdown'
* @import {Options} from 'mdast-util-gfm'
* @import {Options as ToMarkdownExtension} from 'mdast-util-to-markdown'
*/
/**
* Create an extension for `mdast-util-from-markdown` to enable GFM (autolink
* literals, footnotes, strikethrough, tables, tasklists).
*
* @returns {Array<FromMarkdownExtension>}
*   Extension for `mdast-util-from-markdown` to enable GFM (autolink literals,
*   footnotes, strikethrough, tables, tasklists).
*/
function gfmFromMarkdown() {
	return [
		gfmAutolinkLiteralFromMarkdown(),
		gfmFootnoteFromMarkdown(),
		gfmStrikethroughFromMarkdown(),
		gfmTableFromMarkdown(),
		gfmTaskListItemFromMarkdown()
	];
}
/**
* Create an extension for `mdast-util-to-markdown` to enable GFM (autolink
* literals, footnotes, strikethrough, tables, tasklists).
*
* @param {Options | null | undefined} [options]
*   Configuration (optional).
* @returns {ToMarkdownExtension}
*   Extension for `mdast-util-to-markdown` to enable GFM (autolink literals,
*   footnotes, strikethrough, tables, tasklists).
*/
function gfmToMarkdown(options) {
	return { extensions: [
		gfmAutolinkLiteralToMarkdown(),
		gfmFootnoteToMarkdown(options),
		gfmStrikethroughToMarkdown(),
		gfmTableToMarkdown(options),
		gfmTaskListItemToMarkdown()
	] };
}
//#endregion
export { gfmToMarkdown as n, visit as r, gfmFromMarkdown as t };
