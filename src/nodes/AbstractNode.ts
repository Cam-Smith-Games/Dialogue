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



/** this contains all possible attributes that can be set on nodes */
export interface INodeAttributes {
    /** Speed to run through text. 
     * - Null, undefined, and <= 0 values will result in node and all of it's children  getting rendered instantly  @type {number} */
     speed:number;
   
     /** number of milliseconds to wait before processing this node */
     delay?:number;
 
     /** audio src of voice (beep) to play for this node */
     voice?:string;
 
     /** CSS classes to apply to this node (will effect child nodes) */
     classes?:string;
 
     /** text color to apply for this node */
     color?:string;
 
     /** face to render for this node */
     expression?:string; 
}

 //const PROPERTIES = ["speed", "delay", "face", "voice", "classes", "color", "state"];
    
export default class AbstractNode implements INodeAttributes {

    type:string;
    character:Character;

    speed: number;
    delay?: number;
    voice?: string;
    classes?: string;
    color?: string;
    expression?: string;

 

    /**
     * @param [character] character containing this node (used for pulling in state info)
     * @param  [parent] parent to extend properties from */
    constructor(element?:Element, character?:Character, parent:AbstractNode = null) {
        this.character = character;


        // attribute inheritance = character -> parent -> self
        if (character) {
            this.extendCharacter(character);
        }
        // copy extendable properties from parent (if provided)
        if (parent) {
            this.extend(parent);
        }

        if (element) {

            this.apply(element,
                { name: "speed", type: AttributeType.FLOAT, default: 75 },
                { name: "delay", type: AttributeType.NUMBER },
                "face", 
                "voice",
                "classes",
                "color",
                "expression"
            );
        }

        // default speed if undefined (NOTE: allow 0, which means instant)
        if (this.speed == null) {
            this.speed == 75;
        }
    }


    /**
     * Applies specified attributes from element to node. Some attributes require type mapping
     * @param elem HTML element to extract attributes from 
     * @param attributes list of attributes to extract, either in string or tuple form. If tuple, an extra type parameter is passed to parse string to appropriate type
     */
    private apply(elem:Element, ...attributes:(string | IAttribute)[]) {

        for (let a of attributes) {

    
            // arg will either be string or object. if string. just use name
            let attr:IAttribute;
            if (typeof a == "string") {
                attr = {
                    name: a
                }
            }
            else {
                attr = a;
            }


            if (elem.hasAttribute(attr.name)) {
                // get string value from element
                let value = elem.getAttribute(attr.name);

                // parse value if necessary
                if (attr.type in StringParser) {
                    value = StringParser[attr.type](value);
                } 

                // now apply the formatted value to node
                // @ts-ignore
                this[attr.name] = value;
            }
            else if (attr.default != null) {
                // @ts-ignore
                this[attr.name] = attr.default;
            }
        }
    }

    /** Copies values from character.
     * These will be overriden by either parent element or node properties
     */
    private extendCharacter(character:Character) {
        this.speed = character.speed;
        this.voice = character.voice;
    }
    /**
     * Copies values from parent node. 
     * Can be overriden later by node itself if values are defined
    **/
    private extend(parent:AbstractNode) {
        // NOTE: do not copy delay
        let props = ["speed", "voice","classes","color","expression"];
        for (let prop of props) {
            // @ts-ignore
            this[prop] = parent[prop];
        }
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



interface IAttribute {
    name: string;
    type?: AttributeType;
    default?: any
}


enum AttributeType {
    BOOL,
    JSON,
    NUMBER,
    FLOAT
}

/** Object specifying how to map strings to specified typs */
 const StringParser:Record<AttributeType,(str:string)=>any> = {
    // empty bools are interepreted as true (i.e. <... bool /> vs <... bool=true />)
    [AttributeType.BOOL]: str => str == "" || str == "true" ? true : false, 
    [AttributeType.JSON]: str => JSON.parse(str),
    [AttributeType.NUMBER]: str => Number(str),
    [AttributeType.FLOAT]: str => parseFloat(str)
}






/** 
 * @param element element to map value from
 * @returns value mapped from element
 */
 type ElementMapper = (element:Element) => any;