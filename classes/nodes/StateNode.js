import AbstractNode from "./AbstractNode.js";
 
export default class StateNode extends AbstractNode {
    
    id = ""

    /**
     * This is a collection of properties that can be quickly applied to a group of nodes
     * @param {Element} element
    */
    constructor(element) {
        super(element, null, null);

        this.id = element.getAttribute("id");
    }

}
