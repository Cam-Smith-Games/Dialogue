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


    dialogues:Dialogue[];
    states:StateNode[] = [];
        
    defaultState?:StateNode;

    constructor(element:Element) {
        
        this.name = element.getAttribute("name");
        if (!this.name) {
            console.error("Error parsing character: name is required");
            return;
        }

        // @ts-ignore
        this.states = AbstractNode.MapElements(element, "state", child => new StateNode(child));

        if (this.states?.length) {
            this.defaultState = this.states.filter(s => !s.id)[0];
        }

        this.dialogues = <Dialogue[]>AbstractNode.MapElements(element, "dialogue", child => new Dialogue(child, this));
    }


    ///////////////////// STATIC  ///////////////////


    /** Converts DML into collection of characters */
    static GetCharacters(dml:string) {
        const doc = $("<div>").append(dml).get(0);
        // @ts-ignore
        return <Character[]>AbstractNode.MapElements(doc, "character", elem => new Character(elem));
    }
     
 
}
