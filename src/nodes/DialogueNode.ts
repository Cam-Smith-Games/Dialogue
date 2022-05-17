import Character from "../Character.js";
import { IDialogue } from "../Dialogue.js";
import AbstractNode from "./AbstractNode.js";
import ContainerNode from "./ContainerNode.js";
import TextNode from "./TextNode.js";

export default class DialogueNode extends AbstractNode {
    
    nodes: (ContainerNode | TextNode) [] = [];
    next_index: number;

    /**
     * @param element DML Element to extract properties and children from
     * @param character Character containing this dialogue
     */
    constructor(element:Element, character:Character) {   
        super(element, character);

        this.nodes = ContainerNode.GetChildren(element, character, null);

        if (element.hasAttribute("next")) {
            this.next_index = Number(element.getAttribute("next"));
        }

        // TODO: get properties from character current stae?
        //this.extend(character);

   
    }



}