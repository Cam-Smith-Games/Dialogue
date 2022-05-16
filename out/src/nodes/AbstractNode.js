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
var _AbstractNode_instances, _AbstractNode_apply, _AbstractNode_extend;
//const PROPERTIES = ["speed", "delay", "face", "voice", "classes", "color", "state"];
export default class AbstractNode {
    /**
     * @param [element]
     * @param [character] character containing this node (used for pulling in state info)
     * @param  [parent] parent to extend properties from */
    constructor(element, character, parent = null) {
        // attribute inheritance = parent -> state -> self
        _AbstractNode_instances.add(this);
        // copy extendable properties from parent (if provided)
        if (parent) {
            __classPrivateFieldGet(this, _AbstractNode_instances, "m", _AbstractNode_extend).call(this, parent);
        }
        if (element) {
            this.applyState(element, character);
            __classPrivateFieldGet(this, _AbstractNode_instances, "m", _AbstractNode_apply).call(this, element, ["speed", "float"], ["delay", "number"], "face", "voice", "classes", "color");
        }
    }
    applyState(element, character) {
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
    }
    ////////// STATIC ///////////
    /** Maps child elements to appropriate types, excluding nulls **/
    static MapElements(element, selector, mapper) {
        return $(element).children(selector)
            .map((_, child) => mapper(child))
            .filter((_, result) => result != null)
            .toArray();
    }
}
_AbstractNode_instances = new WeakSet(), _AbstractNode_apply = function _AbstractNode_apply(elem, ...attributes) {
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