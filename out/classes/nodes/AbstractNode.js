/**
 * @typedef AbstractProperties
 * @property {number} speed speed to run through text. (null, undefined, and <= 0 will render instantly)
 * @property {number} delay number of milliseconds to wait before processing this node
 * @property {string} face img src to face to apply for this node
 * @property {string} voice audio src of voice (beep) to play for this node
 * @property {string} classes CSS classes to apply to this node (will effect child nodes)
 * @property {string} color text color to apply for this node
 * @property {string} state ID of current state to extend properties from (optional)
 */
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _AbstractNode_instances, _AbstractNode_applyState, _AbstractNode_apply, _AbstractNode_extend;
//const PROPERTIES = ["speed", "delay", "face", "voice", "classes", "color", "state"];
export default class AbstractNode {
    /**
     * @param {Element} [element]
     * @param {import("../character.js").default} [character] character containing this node (used for pulling in state info)
     * @param {AbstractNode} [parent] parent to extend properties from */
    constructor(element, character, parent = null) {
        // attribute inheritance = parent -> state -> self
        _AbstractNode_instances.add(this);
        /** Speed to run through text.
         * Null, undefined, and <= 0 values will result in node and all of it's children  getting rendered instantly
         * @type {number} */
        this.speed = undefined;
        /** number of milliseconds to wait before processing this node
         * @type {number}
         */
        this.delay = undefined;
        /** img src to face to apply for this node
         * @type {string}
         */
        this.face = undefined;
        /** audio src of voice (beep) to play for this node
         * @type {string}
         */
        this.voice = undefined;
        /** CSS classes to apply to this node (will effect child nodes)
          * @type {string}
          */
        this.classes = undefined;
        /** text color to apply for this node
         * @type {string}
         */
        this.color = undefined;
        /** ID of current state to extend properties from (optional)
         * @type {string}
         */
        this.state = undefined;
        // copy extendable properties from parent (if provided)
        if (parent) {
            __classPrivateFieldGet(this, _AbstractNode_instances, "m", _AbstractNode_extend).call(this, parent);
        }
        if (element) {
            __classPrivateFieldGet(this, _AbstractNode_instances, "m", _AbstractNode_applyState).call(this, element, character);
            __classPrivateFieldGet(this, _AbstractNode_instances, "m", _AbstractNode_apply).call(this, element, ["speed", "float"], ["delay", "number"], "face", "voice", "classes", "color");
        }
    }
    ////////// STATIC ///////////
    /**
     * @callback ElementMapper
     * @param {Element} element element to map value from
     * @returns {any} value mapped from element
    */
    /**
     * Maps child elements to appropriate types, excluding nulls
     * @param {Element} element
     * @param {string} selector
     * @param {ElementMapper} mapper
     * @returns {AbstractNode[]}
     **/
    static MapElements(element, selector, mapper) {
        return $(element).children(selector)
            .map((_, child) => mapper(child))
            .filter((_, result) => result != null)
            .toArray();
    }
}
_AbstractNode_instances = new WeakSet(), _AbstractNode_applyState = function _AbstractNode_applyState(element, character) {
    // copy extendable properties from state (if provided)
    if (character) {
        if (element.hasAttribute("state")) {
            const stateID = element.getAttribute("state");
            const state = character.states.filter(s => s.id == stateID)[0];
            if (state) {
                __classPrivateFieldGet(this, _AbstractNode_instances, "m", _AbstractNode_extend).call(this, state);
                return;
            }
        }
        if (character.defaultState) {
            __classPrivateFieldGet(this, _AbstractNode_instances, "m", _AbstractNode_extend).call(this, character.defaultState);
        }
    }
}, _AbstractNode_apply = function _AbstractNode_apply(elem, ...attributes) {
    for (let attr of attributes) {
        // arg will either be string or tuple.
        // string form ignores type and only specifies name
        let name, type = "";
        if (typeof attr == "string") {
            name = attr;
        }
        // tuple form stores both name and type in array format
        else {
            name = attr[0];
            type = attr[1];
        }
        if (elem.hasAttribute(name)) {
            // pull string value from element
            // if type is provided and valid, use appropriate mapper to map value to correct type
            let value = elem.getAttribute(name);
            if (type in StringParser) {
                value = StringParser[type](value);
            }
            // now apply the formatted value to node
            // @ts-ignore
            this[name] = value;
        }
    }
}, _AbstractNode_extend = function _AbstractNode_extend(parent) {
    /*PROPERTIES.forEach(prop => {
        if (parent.hasOwnProperty(prop)) {
            // @ts-ignore
            this[prop] = parent[prop];
        }
    });*/
    this.speed = parent.speed;
    this.delay = parent.delay;
    this.face = parent.face;
    this.voice = parent.voice;
    this.classes = parent.classes;
    this.color = parent.color;
    this.state = parent.color;
};
/**
 * 1 = Attribute Name, 2 = AttributeType
 * @typedef {[string,string]} AttributeTuple
 */
/**
 * Function that converts string to another value type
 * @callback StringParserCallback
 * @param {string} value string to parse
 * @returns {*} value parsed from string
 */
/**
 * Object specifying how to map strings to specified typs
 * @type {Object<string,StringParserCallback>}
*/
const StringParser = {
    // empty bools are interepreted as true (i.e. <... bool /> vs <... bool=true />)
    "bool": str => str == "" || str == "true" ? true : false,
    "json": str => JSON.parse(str),
    "number": str => Number(str),
    "float": str => parseFloat(str)
};
//# sourceMappingURL=AbstractNode.js.map