var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ContainerNode_instances, _ContainerNode_fixType;
import AbstractNode from "./AbstractNode.js";
import TextNode from "./TextNode.js";
export default class ContainerNode extends AbstractNode {
    /**
     *
     * @param {Element} element
     * @param {import("../character.js").default} character
     * @param {AbstractNode} [parent]
     */
    constructor(element, character, parent = null) {
        super(element, character, parent);
        _ContainerNode_instances.add(this);
        /** @type { (ContainerNode|TextNode)[] } */
        this.children = undefined;
        // extracting properties from node type 
        this.type = element.nodeName;
        if (this.type in NODE_MODIFIERS) {
            NODE_MODIFIERS[this.type](this, element);
        }
        __classPrivateFieldGet(this, _ContainerNode_instances, "m", _ContainerNode_fixType).call(this);
        const children = ContainerNode.GetChildren(element, character, this);
        if (children === null || children === void 0 ? void 0 : children.length) {
            this.children = children;
        }
    }
    /**
     *
     * @param {Element} element
     * @param {import('.././Character.js').default} character
     * @param {AbstractNode} [parent]
     * @returns {(ContainerNode|TextNode)[]}
     */
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
                return new ContainerNode(elem, character, parent);
            }
            if (elem.textContent.trim()) {
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
_ContainerNode_instances = new WeakSet(), _ContainerNode_fixType = function _ContainerNode_fixType() {
    if (this.type == "ITALIC")
        return this.type = "i";
    if (this.type == "BOLD")
        return this.type = "b";
    if (this.type == "INLINE")
        return this.type = "span";
    return this.type = "div";
};
/**
 * Function that modifies node in some way
 * @callback NodeModifier
 * @param {ContainerNode} node
 * @param {Element} [element]
 */
/**
 * certain node types apply extra properties to the node, i.e. <delay 500/> needs to translate to <node delay=500/>
 * @type Object<string, NodeModifier>
 */
const NODE_MODIFIERS = {
    /** DELAY nodes attempt to extract the first attribute as a number and apply it to the delay property of the node
     *  i.e. <delay 500 />  => node.delay = 500 */
    DELAY: (node, element) => {
        const value = Number(element.getAttributeNames()[0]);
        if (!isNaN(value)) {
            node.delay = value;
        }
    }
};
//# sourceMappingURL=ContainerNode.js.map