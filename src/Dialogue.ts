import Character from "./Character.js";
import AbstractNode from "./nodes/AbstractNode.js";
import ContainerNode from "./nodes/ContainerNode.js";

export default class Dialogue extends AbstractNode {
    
    nodes: (ContainerNode | import("./nodes/TextNode.js").default) [] = [];
    next: { character: string, index: number };

    /**
     * @param element DML Element to extract properties and children from
     * @param character Character containing this dialogue
     */
    constructor(element:Element, character:Character) {   
        super(element, character);
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
                        }
                        console.log(this.next);
                    }
                }
            }
        }
    }
}