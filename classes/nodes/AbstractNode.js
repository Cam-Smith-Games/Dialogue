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

 //const PROPERTIES = ["speed", "delay", "face", "voice", "classes", "color", "state"];
    
export default class AbstractNode {
    
    /** Speed to run through text. 
     * Null, undefined, and <= 0 values will result in node and all of it's children  getting rendered instantly 
     * @type {number} */
    speed = undefined;
   
    /** number of milliseconds to wait before processing this node
     * @type {number}
     */
    delay = undefined;

    /** img src to face to apply for this node 
     * @type {string}
     */
    face = undefined;

    /** audio src of voice (beep) to play for this node 
     * @type {string}
     */
    voice = undefined;

    /** CSS classes to apply to this node (will effect child nodes)
      * @type {string}
      */
    classes = undefined;

    /** text color to apply for this node 
     * @type {string}
     */
    color = undefined;

    /** ID of current state to extend properties from (optional) 
     * @type {string}
     */
    state = undefined;

    
    /**
     * @param {Element} [element]
     * @param {import("../character.js").default} [character] character containing this node (used for pulling in state info)
     * @param {AbstractNode} [parent] parent to extend properties from */
    constructor(element, character, parent = null) {

        // attribute inheritance = parent -> state -> self

        // copy extendable properties from parent (if provided)
        if (parent) {
            this.#extend(parent);
        }

        if (element) {

            this.#applyState(element, character);

            this.#apply(element,
                ["speed", "float"],
                ["delay", "number"],
                "face", 
                "voice",
                "classes",
                "color"
            );
        }

    }

    /**
     * 
     * @param {Element} element 
     * @param {import("../character.js").default} [character] character containing this node (used for pulling in state info)
     */
    #applyState(element, character) {
        // copy extendable properties from state (if provided)
        if (character) {
            if (element.hasAttribute("state")) {
                const stateID = element.getAttribute("state");
                const state = character.states.filter(s => s.id == stateID)[0];
                if (state) {
                    this.#extend(state);
                    return;
                }
            }

            if (character.defaultState) {
                this.#extend(character.defaultState);
            }

        } 
    }


    /**
     * Applies specified attributes from element to node. Some attributes require type mapping
     * @param {Element} elem HTML element to extract attributes from 
     * @param {(string | AttributeTuple)[]} attributes list of attributes to extract, either in string or tuple form. If tuple, an extra type parameter is passed to parse string to appropriate type
     */
    #apply(elem, ...attributes) {

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

    }

    /**
     * Copies values from parent node. 
     * Can be overriden later by node itself if values are defined
     * @param {AbstractNode} parent 
    **/
    #extend(parent) {
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
        .map((_,child) => mapper(child))
        .filter((_,result) => result != null)
        .toArray();
    }

}



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
}