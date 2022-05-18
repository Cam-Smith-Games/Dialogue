import AbstractNode from "./nodes/AbstractNode.js";
import DialogueNode from "./nodes/DialogueNode.js";
import StateNode from "./nodes/StateNode.js";
import { loadImage } from "./util.js";


interface IVector {
    x:number;
    y:number;
}

export interface ICharacterExpression {
    /* source position within sprite sheet */
    pos: IVector
    /* optional base talk speed for this expression */
    speed?:number
}

/** @note this is the data model for character json files */
export interface ICharacter {
    /** Display name and unique identifier for the Character */
    name: string

    /** sprite size (defualts to 64x64) */
    size?: IVector

    /** dictionary of expressions (can just be a tile position, or an object containing more properties) */
    expressions: Record<string, IVector|ICharacterExpression>

    /** portrait image to render */
    portrait: HTMLImageElement

    /* optional base talk speed for this character */
    speed?:number;

    /** optional sound for character voice */
    voice?:string;
}


export default class Character implements ICharacter {
    name: string;
    size: IVector;
    portrait: HTMLImageElement;
    expressions: Record<string, ICharacterExpression>;
    speed:number;
    voice?:string;

    // #region caching expression
    private _expression_key:string;
    public get expression_key() { return this._expression_key; }
    public set expression_key(val:string) { 
        this._expression_key = val;
        this._expression = null;
    }
   
    private _expression:ICharacterExpression;
    public get expression() {
        if (!this._expression){
            this._expression = this.expressions[this._expression_key];
        }
        return  this._expression;
    }
    // #endregion

    constructor(data:ICharacter) {
        
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
                }
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


    ///////////////////// STATIC  ///////////////////
    
    /** root folder path for dialogue files */
    static ROOT_PATH = "dialogues/characters";

    /** @param id unique id of character (also the relative file path to json/img files inside ROOT_PATH)*/
    static async fetch(id:string) {
        if (id in this.CHARACTERS) {
            //console.log("returning fetched character: ", id);
            return this.CHARACTERS[id];
        }

        //console.log("fetching character...", id);

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
