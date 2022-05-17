import AbstractNode from "./nodes/AbstractNode.js";
import DialogueNode from "./nodes/DialogueNode.js";
import StateNode from "./nodes/StateNode.js";
import { loadImage } from "./util.js";


interface IVector {
    x:number;
    y:number;
}


export interface ICharacter {
    /** Display name and unique identifier for the Character.
     * @todo 
     * In the future, might need to add an optional ID to distinguish 2 characters with the same display name.
     * However, I currently can't think of a scenario where you would ever want 2 characters with the same name.
     */
    name: string
    /** sprite size (defualts to 64x64) */
    size?: IVector

    // TODO: expressions might need more properties. this might turn into "IExpression | IVector"
    /** mapping expression ID to position within sprite sheet */
    expressions: Record<string, IVector>

    portrait: HTMLImageElement
}

export default class Character implements ICharacter {
    name: string;
    size: IVector;
    portrait: HTMLImageElement;
    expressions: Record<string, IVector>;

    /** current expression */
    expression:string;

    constructor(data:ICharacter) {
        
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


    ///////////////////// STATIC  ///////////////////
    
    /** root folder path for dialogue files */
    static ROOT_PATH = "dialogues/characters";

    /** @param id unique id of character (also the relative file path to json/img files inside ROOT_PATH)*/
    static async fetch(id:string) {
        if (id in this.CHARACTERS) {
            console.log("returning fetched character: ", id);
            return this.CHARACTERS[id];
        }

        console.log("fetching character...", id);

        let full_path = `${Character.ROOT_PATH}/${id}.json`;
        const response = await fetch(full_path);
        const data = <ICharacter>await response.json();

        // getting portrait img (img name should be same as json name)
        // TODO: if img extension is not PNG, include a property in character json
        let img_ext = "png";
        let img_path = `${Character.ROOT_PATH}/${id}.${img_ext}`;
        const img = await loadImage(img_path);
        data.portrait = img;

        return this.CHARACTERS[id] = new Character(data);
    }
     
 
    /** global cache of all characters instances. they get saved here upon fetching */
    private static readonly CHARACTERS: Record<string,Character>  = {};
}
