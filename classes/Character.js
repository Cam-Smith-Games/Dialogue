import AbstractNode from "./nodes/AbstractNode.js";
import Dialogue from "./Dialogue.js";
import StateNode from "./nodes/StateNode.js";

export default class Character {
    
    /** Display name and unique identifier for the Character.
     * @todo 
     * In the future, might need to add an optional ID to distinguish 2 characters with the same display name.
     * However, I currently can't think of a scenario where you would ever want 2 characters with the same name.
     */
    name = "";


    /** @type {Dialogue[]} */
    dialogues = [];


    /** @type {StateNode[]} */
    states = [];
        
    /**
     * @param {Element} element 
    */
    constructor(element) {
        
        this.name = element.getAttribute("name");
        if (!this.name) {
            console.error("Error parsing character: name is required");
            return;
        }

        // @ts-ignore
        this.states = AbstractNode.MapElements(element, "state", child => new StateNode(child));

        if (this.states?.length) {
            /** @type { StateNode } */
            this.defaultState = this.states.filter(s => !s.id)[0];
        }

        // @ts-ignore
        this.dialogues = AbstractNode.MapElements(element, "dialogue", child => new Dialogue(child, this));
    }


    ///////////////////// STATIC  ///////////////////


    /**
     * Converts DML into collection of characters
     * @param {string} dml 
     * @returns {Character[]}
     */
    static GetCharacters(dml) {
        const doc = $("<div>").append(dml).get(0);
        // @ts-ignore
        return AbstractNode.MapElements(doc, "character", elem => new Character(elem));
    }
     
 
}
