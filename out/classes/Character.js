import AbstractNode from "./nodes/AbstractNode.js";
import Dialogue from "./Dialogue.js";
import StateNode from "./nodes/StateNode.js";
export default class Character {
    /**
     * @param {Element} element
    */
    constructor(element) {
        var _a;
        /** Display name and unique identifier for the Character.
         * @todo
         * In the future, might need to add an optional ID to distinguish 2 characters with the same display name.
         * However, I currently can't think of a scenario where you would ever want 2 characters with the same name.
         */
        this.name = "";
        /** @type {Dialogue[]} */
        this.dialogues = [];
        /** @type {StateNode[]} */
        this.states = [];
        this.name = element.getAttribute("name");
        if (!this.name) {
            console.error("Error parsing character: name is required");
            return;
        }
        // @ts-ignore
        this.states = AbstractNode.MapElements(element, "state", child => new StateNode(child));
        if ((_a = this.states) === null || _a === void 0 ? void 0 : _a.length) {
            /** @type { StateNode } */
            this.defaultState = this.states.filter(s => !s.id)[0];
        }
        // @ts-ignore
        this.dialogues = AbstractNode.MapElements(element, "dialogue", child => new Dialogue(child, this));
    }
    ///////////////////// STATIC  ///////////////////
    /**
     * Converts DML into collection of characters
     * @param {string} dml
     * @returns {Character[]}
     */
    static GetCharacters(dml) {
        const doc = $("<div>").append(dml).get(0);
        // @ts-ignore
        return AbstractNode.MapElements(doc, "character", elem => new Character(elem));
    }
}
//# sourceMappingURL=Character.js.map