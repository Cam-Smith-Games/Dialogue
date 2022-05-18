import AbstractNode from "./AbstractNode.js";
import ContainerNode from "./ContainerNode.js";
export default class DialogueNode extends AbstractNode {
    /**
     * @param element DML Element to extract properties and children from
     * @param character Character containing this dialogue
     */
    constructor(element, character) {
        super(element, character);
        this.nodes = [];
        this.nodes = ContainerNode.GetChildren(element, character, null);
        if (element.hasAttribute("next")) {
            this.next_index = Number(element.getAttribute("next"));
        }
        // TODO: get properties from character current stae?
        //this.extend(character);
    }
}
//# sourceMappingURL=DialogueNode.js.map