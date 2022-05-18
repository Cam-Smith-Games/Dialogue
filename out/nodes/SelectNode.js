import AbstractNode from "./AbstractNode.js";
export default class SelectNode extends AbstractNode {
    constructor(element, character, parent = null) {
        super(null, character, parent);
        /** text to render inside this node. only set for lowest-level text nodes */
        this.options = [];
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
//# sourceMappingURL=SelectNode.js.map