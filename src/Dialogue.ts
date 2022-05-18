import Character from "./Character.js";
import DialogueNode from "./nodes/DialogueNode.js";
import { Task } from "./modules/task.js";
import ContainerNode from "./nodes/ContainerNode.js";
import TextNode from "./nodes/TextNode.js";
import { SoundPlayer } from "./SoundPlayer.js";
import SelectNode from "./nodes/SelectNode.js";



// #region SOUND
// storing same sound multiple times so we can play them super fast
await SoundPlayer.Add({
    src: "boop.ogg",
    count: 10,
    delay: 50
});
function boop() { SoundPlayer.Play("boop.ogg"); }

// #endregion



// speed = number of blips per second
let speed = 15;

let $target:JQuery<HTMLElement>;


const $dialogue = $(".dialogue");


const portrait:HTMLCanvasElement = <HTMLCanvasElement>$dialogue.find("canvas").get(0);
portrait.style.imageRendering = "pixelated";
const pctx = portrait.getContext("2d");
pctx.imageSmoothingEnabled = false;


export interface IDialogue {
    /** unique identifier of this dialogue (usually matches file name) */
    id:string;
    nodes: (DialogueNode|SelectNode)[];
}
export class Dialogue implements IDialogue  {

    id:string;
    nodes:(DialogueNode|SelectNode)[] = [];
    queue:Task[] = [];

    character:Character;

    constructor (inst:IDialogue) {
        this.id = inst.id;
        this.nodes = inst.nodes;   
        console.log("DIALOGUE: ", this);
    }

   
    private renderPortrait() {
        pctx.clearRect(0, 0, portrait.width, portrait.height);

        let c = this.character;
        let s = c.size;
        portrait.width = s.x;
        portrait.height = s.y;
        let exp = c.expressions[c.expression_key].pos;
        pctx.drawImage(
            c.portrait, 
            exp.x, exp.y, s.x, s.y,
            0, 0, s.x, s.y
        );
    }

    private processAbstract(node:ContainerNode|TextNode) {
        // these have to be checked at runtime
        this.queue.push({
            title: "update",
            delay: node.delay,
            func: () => {
                // checking face
                // TODO: "face" property replaced with expression
                //          get img and sprite size from character, and position from expression

                if (node.character) {
                    $dialogue.find(".profile").show().find(".name").text(node.character.name);

                    let render = false;
                    if (node.character != this.character) {
                        this.character = node.character;
                        render = !!this.character;
                    }
                    if (node.expression && node.expression != this.character.expression_key) {
                        this.character.expression_key = node.expression;
                        render = !!this.character;
                    }
                    if (render) {
                        this.renderPortrait();
                    }
                    // checking speed
                    if (node.speed != null) {
                        speed = node.speed;
                    }
                }
                else {
                    this.character = null;
                    $dialogue.find(".profile").hide();
                }
               
            }
        })


        if (node instanceof ContainerNode) {
            this.processContainer(node);
        } else {
            this.processText(node);
        }
    }


    private processContainer (node:ContainerNode) {
        console.log("processing container");

        if (node?.children?.length) {
            const classes = node.classes?.length ? (" class='" + node.classes + "' ") : "";   
            const color = node.color ? (" style='color:" + node.color + "'") : "";
            const html = "<" + node.type + classes + color + "></" + node.type + ">"
            const $container = $(html);

            // ENTERING CONTAINER
            this.queue.push({
                title: "Generating container: " + html,
                func: () => $target = $container.appendTo($target),
                instant: true
            });

            // RECURSION
            node.children.forEach(child => this.processAbstract(child));        

            // EXITING CONTAINER
            this.queue.push({
                title: "Exiting container: " + html,
                delay: 100,
                func: () => $target = $container.parent(),
                instant: true
            });
        }
    }

    private processSelection (node:SelectNode) {

   
        
        this.queue.push({
            title: "OPTION SELECTION",
            func: () => {


                // stop listening for clicks
                $dialogue.off()

                /*
                // checking portrait
                let render = false;
                if (node.character != this.character) {
                    this.character = node.character;
                    render = true;
                }
                if (node.expression && node.expression != this.character.expression_key) {
                    this.character.expression_key = node.expression;
                    render = true;
                }
                if (render) {
                    this.renderPortrait();
                }
                */

                const $options = 
                $dialogue.removeClass("active")
                .find(".content .text")
                .html(
                    `<select multiple>
                        ${(
                            node.options.map(s => (
                                `<option>${s.text}</option>`
                            ))
                            .join("")
                        )}
                    </select>`
                )
                .find("select option");

                let that = this;
                $options.on("click", async function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    let index = $(this).index();

                    console.log("option click: ", index)

                    let option = node.options[index];
                    if (option.dialogue) {
                        let d = Dialogue.Dialogues[option.dialogue];
                        d.start(option.node || 0);
                    }
                    else if (option.node) {
                        console.log("STARTING FROM DIALOGUE OPTION");
                        that.start(option.node);
                    }

                })
     

            }
        })
    }

    private processText(node:TextNode) {
        console.log("processing text");

        // GENERATING TEXT
        if (node.text?.length) {
            // instant nodes get text applied in one chunk
            if (node.speed <= 0) {
                this.queue.push({
                    title: "text (instant): " + node.text,
                    func: () => {
                        $target.append(node.text);
                        boop();
                    }
                })
            }
            // non-instant nodes get separate task for each char
            else {
                for (let char of node.text.split("")) {
                    this.queue.push({
                        title: "char: " + char,
                        func: () => {
                            $target.append(char); 
                            // TODO: pass voice
                            if (!node.speed || node.speed > 0 && char?.trim()) {
                                boop();
                            }
                        }
                    })
                }
            }
        }
    }


    
    /**
     * Builds up a task queue for the specified character/dialogue and then execute its in sequence
     * @param index index of the dialogue within this characters dialogue collection
     */
    public async start (index:number) {

        console.log("STARTING: ", index);

        const node = this.nodes[index];
        if (!node) {
            console.error("failed to find dialogue node with index = ", index);
            return;
        }

        // TODO: ".dialogue" will need to be a configurable selector
        $target = $dialogue.find(".text").html("");

        // building queue...
        this.queue = []; 
        if (node) {
            // if "nodes" exists, it's a dialogue node
            if ("nodes" in node) {
                for (let n of node.nodes) {
                    this.processAbstract(n);
                }
            }
            // otherwise, a select node
            else {
                this.processSelection(node);
            }
        }

        const debug = false;

        $dialogue
            .off()
            .addClass("active")
            // clicking dialogue instantly finishes
            .on("click", () => {

                if (debug) {
                    processQueue();
                    console.log(this.queue);
                    return;
                }

                // if tasks are still queued, immediately finish them
                // second click will advance
                if (this.queue.length) {
                    console.log("INSTANTTTTTT LEEEEEE");
                    SoundPlayer.Enabled = false;                
                    this.queue.forEach(q => q.instant = true);
                }          
                // already done -> immedaitely proceed
                else {
                    if ("next_index" in node && node.next_index) {
                        this.start(node.next_index);
                    }
                    else if (index < this.nodes.length - 1) {
                        this.start(index + 1);
                    }
                    else {
                        //console.log("clicked with no next_index");
                    }
                }

            });

        const $title = $("#debug .title");
        const $delay = $("#debug .delay");

        // running queue tasks...
        const processQueue = async () => {
            if (!this.queue.length) {
                console.log("done");
                SoundPlayer.Enabled = true;
                $("#text").find(".arrow").show();
                return;
            }
        
            const task = this.queue.shift();
            //console.log("TASK: ", task.title);
            $title.text(task.title);

            
            if (!task.instant) {
                let delay = (task.delay || 0) + (1000 / speed)
                if (delay > 0) {
                    //console.log("%cdelay: " + delay, "color:gray");
                    $delay.html(Math.round(delay) + "ms");
                    await new Promise((resolve, _) => setTimeout(resolve, delay));
                }

            } 

            $delay.html("complete");
            if (task.func) {
                task.func();
            }

            if (!debug) processQueue();
        }  

        processQueue();


    }





    // #region static dialogue retrieval 
    /** root folder path for dialogue files */
    static ROOT_PATH = "dialogues";

    /** @param path dml file path (must exist inside ROOT_PATH) */
    static async fetch(path:string) {
        let full_path = `${Dialogue.ROOT_PATH}/${path}.dml`;
        const response = await fetch(full_path);
        const dml = await response.text();
        let dialogues = await Dialogue.parse(dml); 
        return dialogues;
    }

    /** parse DML into collection of dialogues
     * @note only dialogues nodes can exist at root level. all other node types will be ignored
     */
    static async parse(dml:string):Promise<Dialogue[]> {
        const docs = $("<div></div>").append(dml).children("dialogue").toArray();
        let args = await Promise.all(docs.map(d => this.get(d)));
        let dialogues:Dialogue[] = args.map(a => new Dialogue(a));
        for (let d of dialogues) {
            this.Dialogues[d.id] = d;
        }
        return dialogues;
    }

    static async get(doc:HTMLElement):Promise<IDialogue> {
        let id = doc.getAttribute("id");
        
        let nodes = $(doc).children("node, select").toArray();
        let dialogue_nodes:(DialogueNode|SelectNode)[] = [];
        for (let n of nodes) {
            // dialogue node
            if (n.nodeName == "NODE") {

                let character:Character;
                if (n.hasAttribute("character")) {
                    let characterID = n.getAttribute("character");
                    character = await Character.fetch(characterID);
                }
                dialogue_nodes.push(new DialogueNode(n, character));
            }
            // selection
            else {
                // todo: player can have character too. this would need to be built into player class of engine tho
                dialogue_nodes.push(new SelectNode(n, null))
            }

        }
        
        return {
            id: id,
            nodes: dialogue_nodes
        };          
    }
    // #endregion


    private static Dialogues:Record<string,Dialogue> = {};
};




// TODO: separate queue building from queue running

// QueueBuilder class with abstract QueueTask implementations

//  instead of processAbstract -> processText/processNode
//  create AbstractTask, TextTask, etc



class Queue<T> {

}



interface IQueueTask {
    title: string;
    func?: () => void;
    instant?: boolean;
    delay?: number;
}


class QueueTask implements IQueueTask {

    title: string;
    func?: () => void;
    instant?: boolean;
    delay?: number;

    constructor(args:IQueueTask) {
        this.title = args.title;
        this.func = args.func;
        this.instant = args.instant;
        this.delay = args.delay;
    }

}