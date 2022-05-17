import { loadImage } from "./util.js";
export default class Character {
    constructor(data) {
        this.name = data.name;
        if (!this.name) {
            console.error("Error parsing character: name is required");
            return;
        }
        this.size = data.size || { x: 64, y: 64 };
        this.portrait = data.portrait;
        this.expressions = data.expressions;
        // defaulting expression
        if ("default" in this.expressions) {
            this.expression = "default";
        }
        else {
            let keys = Object.keys(this.expressions);
            if (keys.length) {
                this.expression = keys[0];
            }
            else {
                // TODO: if this happens, just render entire image
                console.error("character contains no expressions!");
            }
        }
    }
    /** @param id unique id of character (also the relative file path to json/img files inside ROOT_PATH)*/
    static async fetch(id) {
        if (id in this.CHARACTERS) {
            console.log("returning fetched character: ", id);
            return this.CHARACTERS[id];
        }
        console.log("fetching character...", id);
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