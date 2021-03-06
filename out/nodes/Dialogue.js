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
            const next = element.getAttribute("next");
            if (next) {
                let split = next.split("_");
                if (split.length == 2) {
                    const characterName = split[0];
                    const index = Number(split[1]);
                    if (characterName && !isNaN(index)) {
                        this.next = {
                            character: characterName,
                            index: index
                        };
                        console.log(this.next);
                    }
                }
            }
        }
    }
}
//# sourceMappingURL=Dialogue.js.map