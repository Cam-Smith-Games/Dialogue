import Character from "../Character.js";
import AbstractNode from "./AbstractNode.js";

export default class TextNode extends AbstractNode {

    /** text to render inside this node. only set for lowest-level text nodes */
    text = "";

    constructor(element:ChildNode, character:Character, parent:AbstractNode = null) {
        super(null, character, parent);
        this.text = element.textContent;
    }

}