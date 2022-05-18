import AbstractNode from "./AbstractNode.js";

export default class TextNode extends AbstractNode {

    /** text to render inside this node. only set for lowest-level text nodes */
    text = "";

    /**
     * 
     * @param {ChildNode} element
     * @param {import("../character.js").default} character
     * @param {AbstractNode} [parent]
     */
    constructor(element, character, parent = null) {
        super(null, character, parent);
        this.text = element.textContent;
    }

}