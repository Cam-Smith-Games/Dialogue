import Character from "../Character.js";
import AbstractNode from "./AbstractNode.js";
import TextNode from "./TextNode.js";

export default class ContainerNode extends AbstractNode {


    children: (ContainerNode|TextNode)[];


    constructor(element:Element, character:Character, parent:AbstractNode = null) {
        super(element, character, parent);

        // extracting properties from node type 
        this.type = element.nodeName;
        if (this.type in NODE_MODIFIERS) {
            NODE_MODIFIERS[this.type](this, element);
        }

        this.#fixType();

        const children = ContainerNode.GetChildren(element, character, this);
        if (children?.length) {
            this.children = children;
        }
    }

    /** fixes node type to be a valid html type */
    #fixType () {

        if (this.type == "ITALIC") 
            return this.type = "i";

        if (this.type == "BOLD") 
            return this.type = "b";

        if (this.type == "INLINE") 
            return this.type = "span";

        return this.type = "div";

    }


    static GetChildren(element:Element, character:Character, parent:AbstractNode): (ContainerNode|TextNode)[] {
        /*console.log({
            element: element,
            children: element.children,
            childNodes: element.childNodes
        }) */

        return Array
            .from(element.childNodes)      
            .map(elem => {
                if (elem instanceof Element) {
                    console.log("container node", elem);
                    return new ContainerNode(elem, character, parent)
                }
                if (elem.textContent.trim()) {
                    console.log("text node", elem);
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




/** function that modifies node in some way */
type NodeModifier = (node:ContainerNode, element: Element) => void;

// TODO: use enum for key

/** 
 * certain node types apply extra properties to the node, i.e. <delay 500/> needs to translate to <node delay=500/> */
 const NODE_MODIFIERS:Record<string,NodeModifier> = {
    /** DELAY nodes attempt to extract the first attribute as a number and apply it to the delay property of the node
     *  i.e. <delay 500 />  => node.delay = 500 */
    DELAY: (node,element) => { 
        const value = Number(element.getAttributeNames()[0]);
        if (!isNaN(value)) {
            node.delay = value;
        }
    }
}