import { loadImage } from "./util.js";
export default class Character {
    // #endregion
    constructor(data) {
        this.name = data.name;
        if (!this.name) {
            console.error("Error parsing character: name is required");
            return;
        }
        this.size = data.size || { x: 64, y: 64 };
        this.portrait = data.portrait;
        this.speed = data.speed || 75;
        this.voice = data.voice;
        // parsing expressions (could be an ICharacterExpression or just a vector)
        this.expressions = {};
        for (let key in data.expressions) {
            let exp = data.expressions[key];
            if ("pos" in exp) {
                this.expressions[key] = exp;
            }
            else {
                this.expressions[key] = {
                    pos: exp
                };
            }
        }
        // defaulting expression
        if ("default" in this.expressions) {
            this._expression_key = "default";
        }
        else {
            let keys = Object.keys(this.expressions);
            if (keys.length) {
                this._expression_key = keys[0];
            }
            else {
                // TODO: if this happens, just render entire image
                console.error("character contains no expressions!");
            }
        }
    }
    get expression_key() { return this._expression_key; }
    set expression_key(val) {
        this._expression_key = val;
        this._expression = null;
    }
    get expression() {
        if (!this._expression) {
            this._expression = this.expressions[this._expression_key];
        }
        return this._expression;
    }
    /** @param id unique id of character (also the relative file path to json/img files inside ROOT_PATH)*/
    static async fetch(id) {
        if (id in this.CHARACTERS) {
            //console.log("returning fetched character: ", id);
            return this.CHARACTERS[id];
        }
        //console.log("fetching character...", id);
        let full_path = `${Character.ROOT_PATH}/${id}.json`;
        const response = await fetch(full_path);
        const data = await response.json();
        // getting portrait img (img name should be same as json name)
        // TODO: if img extension is not PNG, include a property in character json
        let img_ext = "png";
        let img_path = `${Character.ROOT_PATH}/${id}.${img_ext}`;
        const img = await loadImage(img_path);
        data.portrait = img;
        return this.CHARACTERS[id] = new Character(data);
    }
}
///////////////////// STATIC  ///////////////////
/** root folder path for dialogue files */
Character.ROOT_PATH = "dialogues/characters";
/** global cache of all characters instances. they get saved here upon fetching */
Character.CHARACTERS = {};
//# sourceMappingURL=Character.js.map