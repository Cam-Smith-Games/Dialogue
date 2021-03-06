import AbstractNode from "./AbstractNode.js";
import TextNode from "./TextNode.js";
export default class ContainerNode extends AbstractNode {
    constructor(element, character, parent = null) {
        super(element, character, parent);
        // extracting properties from node type 
        this.type = element.nodeName;
        if (this.type in NODE_MODIFIERS) {
            NODE_MODIFIERS[this.type](this, element);
        }
        this.fixType(element);
        const children = ContainerNode.GetChildren(element, character, this);
        if (children === null || children === void 0 ? void 0 : children.length) {
            this.children = children;
        }
    }
    /** fixes node type to be a valid html type */
    fixType(element) {
        if (this.type == "ITALIC" || this.type == "I")
            return this.type = "i";
        if (this.type == "BOLD" || this.type == "B" || element.hasAttribute("bold"))
            return this.type = "b";
        if (this.type == "INLINE" || this.type == "SPAN" || element.hasAttribute("inline"))
            return this.type = "span";
        return this.type = "div";
    }
    static GetChildren(element, character, parent) {
        /*console.log({
            element: element,
            children: element.children,
            childNodes: element.childNodes
        }) */
        return Array
            .from(element.childNodes)
            .map(elem => {
            if (elem instanceof Element) {
                //console.log("container node", elem);
                return new ContainerNode(elem, character, parent);
            }
            if (elem.textContent.trim()) {
                //console.log("text node", elem);
                return new TextNode(elem, character, parent);
            }
            return null;
        })
            .filter(node => node != null);
        /* @ts-ignore
        return AbstractNode.MapElements(
            element,
            ":not(dialogue,character)",
            elem =>
                elem.nodeName == "#text" ?
                new TextNode(elem, character, parent) :
                new ContainerNode(elem, character, parent)
        );*/
    }
}
// TODO: use enum for key
/**
 * certain node types apply extra properties to the node, i.e. <delay 500/> needs to translate to <node delay=500/> */
const NODE_MODIFIERS = {
    /** DELAY nodes attempt to extract the first attribute as a number and apply it to the delay property of the node
     *  i.e. <delay 500 />  => node.delay = 500 */
    DELAY: (node, element) => {
        const value = Number(element.getAttributeNames()[0]);
        if (!isNaN(value)) {
            node.delay = value;
        }
    },
    // S (short for "sentence") adds delay between sentences
    // TODO: pull this delay from character's speed properties?
    S: (node, element) => {
        // NOTE: first sentence does not need delay
        if (!node.delay && element.previousElementSibling) {
            node.delay = 500;
        }
    }
};
//# sourceMappingURL=ContainerNode.js.map