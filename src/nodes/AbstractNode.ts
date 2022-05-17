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

import Character from "../Character.js";


 //const PROPERTIES = ["speed", "delay", "face", "voice", "classes", "color", "state"];
    
export default class AbstractNode {
    
    /** Speed to run through text. 
     * - Null, undefined, and <= 0 values will result in node and all of it's children  getting rendered instantly  @type {number} */
    speed:number;
   
    /** number of milliseconds to wait before processing this node */
    delay:number;

    /** img src to face to apply for this node */
    face:string;

    /** audio src of voice (beep) to play for this node */
    voice:string;

    /** CSS classes to apply to this node (will effect child nodes) */
    classes:string;

    /** text color to apply for this node */
    color:string;

    /** ID of current state to extend properties from (optional) */
    state:string;

    type:string;
    
    character:Character;
    expression?:string;

    /**
     * @param [character] character containing this node (used for pulling in state info)
     * @param  [parent] parent to extend properties from */
    constructor(element?:Element, character?:Character, parent:AbstractNode = null) {
        this.character = character;

        // attribute inheritance = parent -> state -> self

        // copy extendable properties from parent (if provided)
        if (parent) {
            this.extend(parent);
        }

        if (element) {

            this.apply(element,
                ["speed", "float"],
                ["delay", "number"],
                "face", 
                "voice",
                "classes",
                "color",
                "expression"
            );
        }

    }


    /**
     * Applies specified attributes from element to node. Some attributes require type mapping
     * @param elem HTML element to extract attributes from 
     * @param attributes list of attributes to extract, either in string or tuple form. If tuple, an extra type parameter is passed to parse string to appropriate type
     */
    private apply(elem:Element, ...attributes:(string | AttributeTuple)[]) {

        for (let attr of attributes) {

    
            // arg will either be string or tuple. string form ignores type and only specifies name
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
    **/
    private extend(parent:AbstractNode) {
        this.speed = parent.speed;
        this.delay = parent.delay;
        this.face = parent.face;
        this.voice = parent.voice;
        this.classes = parent.classes;
        this.color = parent.color;
        this.state = parent.color;
        this.expression = parent.expression;
    }

    ////////// STATIC ///////////
    


    /** Maps child elements to appropriate types, excluding nulls **/
     static MapElements(element:Element, selector:string, mapper:ElementMapper):AbstractNode[] {
        return $(element).children(selector)
        .map((_,child) => mapper(child))
        .filter((_,result) => result != null)
        .toArray();
    }

}



/**
 * Object specifying how to map strings to specified typs
 * @type {Object<string,StringParserCallback>}
*/
 const StringParser:Record<string,StringParserCallback> = {
    // empty bools are interepreted as true (i.e. <... bool /> vs <... bool=true />)
    "bool": str => str == "" || str == "true" ? true : false, 
    "json": str => JSON.parse(str),
    "number": str => Number(str),
    "float": str => parseFloat(str)
}



/** 
 * @param element element to map value from
 * @returns value mapped from element
 */
 type ElementMapper = (element:Element) => any;


 /**
  * Function that converts string to another value type
  * @param value string to parse
  * @returns value parsed from string
  */
 type StringParserCallback = (value:string) => any;
 




 /** 1 = Attribute Name, 2 = AttributeType  */
type AttributeTuple = ([string,string]);


