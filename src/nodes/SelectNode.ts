import Character from "../Character.js";
import AbstractNode from "./AbstractNode.js";


interface ISelectOption {
    text:string;

    /** if provided, clicking this option will jump to a the dialogue with specified ID */
    dialogue?:string;

    /* if provided, clicking this option willm jump dialogue to this node index */
    node?:number;

}
export default class SelectNode extends AbstractNode {

    /** text to render inside this node. only set for lowest-level text nodes */
    options:ISelectOption[] = [];

    constructor(element:HTMLElement, character:Character, parent:AbstractNode = null) {
        super(null, character, parent);

        let nodes = $(element).children("option").toArray();
        for (let node of nodes) {

            let dialogue;
            if (node.hasAttribute("dialogue")) {
                dialogue = node.getAttribute("dialogue");
            }
            let node_index;
            if (node.hasAttribute("node")) {
                node_index = Number(node.getAttribute("node"));
            }
               
            this.options.push({
                text: node.textContent,

                dialogue: dialogue,
                node: node_index,
            });
        }

    }

}