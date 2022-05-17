import Character from "./Character.js";
import DialogueNode from "./nodes/DialogueNode.js";
import { sound, SoundOptions } from "./modules/ion.sound.js";
import { Task } from "./modules/task.js";
import ContainerNode from "./nodes/ContainerNode.js";
import TextNode from "./nodes/TextNode.js";



// #region SOUND
// storing same sound multiples (distinguished by alias) so we can play them super fast
let sounds:SoundOptions[]= [];
for (var i = 1; i <= 15; i++) {
    sounds.push({
        name: "boop.ogg",
        alias: "boop_" + i
    });
}
sound({
    sounds: sounds,
    path: "assets/sound/",
    ext: "ogg",
    preload: true,
    multiplay: true
});

let soundEnabled = true;
let index = 0;
function playBeep () {
    if (soundEnabled) {
        index = ++index % sounds.length;
        sound.play(sounds[index].alias);
    }
}
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
    nodes: DialogueNode[];
}
export class Dialogue implements IDialogue  {

    id:string;
    nodes:DialogueNode[] = [];
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
        let expression = c.expressions[c.expression];
        pctx.drawImage(
            c.portrait, 
            expression.x, expression.y, s.x, s.y,
            0, 0, s.x, s.y
        );
    }

    private processAbstract(node:ContainerNode|TextNode) {
        if (node.delay) {
            this.queue.push({
                title: "delay: " + node.delay.toString(),
                delay: node.delay
            });
        }

        // these have to be checked at runtime
        this.queue.push({
            title: "update",
            func: () => {
                // checking face
                // TODO: "face" property replaced with expression
                //          get img and sprite size from character, and position from expression

                let render = false;
                if (node.character != this.character) {
                    this.character = node.character;
                    render = true;
                }
                if (node.expression && node.expression != this.character.expression) {
                    this.character.expression = node.expression;
                    render = true;
                }
                if (render) {
                    this.renderPortrait();
                }

                // checking speed
                if (node.speed != null) {
                    speed = node.speed;
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

            this.queue.push({
                title: "exit container delay",
                delay: 100
            });

            // EXITING CONTAINER
            this.queue.push({
                title: "Exiting container: " + html,
                func: () => $target = $container.parent(),
                instant: true
            });
        }
    }


    private processText(node:TextNode) {

        // GENERATING TEXT
        if (node.text?.length) {
            // instant nodes get text applied in one chunk
            if (node.speed <= 0) {
                this.queue.push({
                    title: "text (instant): " + node.text,
                    func: () => {
                        $target.append(node.text);
                        playBeep();
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
                            if (node.speed > 0 && char?.trim()) {
                                playBeep();
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
 

     console.log("QUEUE: ", this.queue);


        console.log("RESETTING");

        // TODO: ".dialogue" will need to be a configurable selector
        $target = $dialogue.find(".text").html("");

        /** @type {Task[]} */
        this.queue = []; 

        if (node?.nodes?.length) {
            for (let n of node.nodes) {
                this.processAbstract(n);
            }
        } 

        $dialogue
        .addClass("active")
        .find(".name").text(node.character.name);



 

        // #region EVENTS
        $dialogue
            .off()
            // clicking dialogue instantly finishes
            .on("click", () => {
                console.log("clicky", node);


                // if tasks are still queued, immediately finish them
                // second click will advance
                if (this.queue.length) {
                    soundEnabled = false;                
                    this.queue.forEach(q => q.instant = true);
                }          
                // already done -> immedaitely proceed
                else {
                    if (node.next_index) {
                        this.start(node.next_index);
                    }
                    else if (index < this.nodes.length - 1) {
                        this.start(index + 1);
                    }
                    else {
                        console.log("clicked with no next_index");
                    }
                }

     
            
            })
        //#endregion

        const processQueue = async () => {
            if (!this.queue.length) {
                console.log("done");
                soundEnabled = true;
                $("#text").find(".arrow").show();
                return;
            }
        
            const task = this.queue.shift();
            //console.log("TASK: ", task.title);

            
            if (!task.instant) {
                let delay = (task.delay ? task.delay : 0) + (1000 / speed)
                if (delay > 0) {
                    //console.log("%cdelay: " + delay, "color:gray");
                    await new Promise((resolve, _) => setTimeout(resolve, delay));
                }

            } 

            if (task.func) {
                task.func();
            }

            processQueue();
        }  

        processQueue();
    }







    // #region static
    /** root folder path for dialogue files */
    static ROOT_PATH = "dialogues";

    /** @param path dml file path (must exist inside ROOT_PATH) */
    static async fetch(path:string) {
        let full_path = `${Dialogue.ROOT_PATH}/${path}.dml`;
        const response = await fetch(full_path);
        const dml = await response.text();
        let dialogue = await Dialogue.parse(dml); 
        return new Dialogue(dialogue);

    }

    /** parse DML into collection of dialogues
     * @note only dialogues nodes can exist at root level. all other node types will be ignored
     */
    static async parse(dml:string) {
        const doc = $(dml).get(0);

        let id = doc.getAttribute("id");
        
        let nodes = $(doc).children("node").toArray();
        let dialogue_nodes:DialogueNode[] = [];
        for (let n of nodes) {
            if (n.hasAttribute("character")) {
                let characterID = n.getAttribute("character");
                let character = await Character.fetch(characterID);
                dialogue_nodes.push(new DialogueNode(n, character));
            }
            else {
                console.error("dialogue node contains no character", n.innerHTML);
            }
        }
        
        return {
            id: id,
            nodes: dialogue_nodes
        };          
    }
    // #endregion

};


