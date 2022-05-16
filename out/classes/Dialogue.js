import AbstractNode from "./nodes/AbstractNode.js";
import ContainerNode from "./nodes/ContainerNode.js";
export default class Dialogue extends AbstractNode {
    /**
     * @param {Element} element DML Element to extract properties and children from
     * @param {import("./Character.js").default} character Character containing this dialogue
     */
    constructor(element, character) {
        super(element, character);
        /** @type { (ContainerNode | import("./nodes/TextNode.js").default) [] }*/
        this.nodes = [];
        /** @type {{ character: string, index: number }}  */
        this.next = undefined;
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