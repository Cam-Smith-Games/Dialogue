import AbstractNode from "./AbstractNode.js";
export default class StateNode extends AbstractNode {
    /** This is a collection of properties that can be quickly applied to a group of nodes */
    constructor(element) {
        super(element, null, null);
        this.id = "";
        this.id = element.getAttribute("id");
    }
}
//# sourceMappingURL=StateNode.js.map