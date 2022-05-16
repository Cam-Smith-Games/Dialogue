import AbstractNode from "./AbstractNode.js";
export default class TextNode extends AbstractNode {
    /**
     *
     * @param {ChildNode} element
     * @param {import("../character.js").default} character
     * @param {AbstractNode} [parent]
     */
    constructor(element, character, parent = null) {
        super(null, character, parent);
        /** text to render inside this node. only set for lowest-level text nodes */
        this.text = "";
        this.text = element.textContent;
    }
}
//# sourceMappingURL=TextNode.js.map