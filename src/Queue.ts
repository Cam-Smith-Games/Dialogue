import Character from "./Character.js";
import Dialogue from "./Dialogue.js";
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
    path: "res/sound/",
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


const face:HTMLImageElement = <HTMLImageElement>$dialogue.find(".profile img").get(0);

export default class DialogueQueue  {

    /**
     * @param path file path to dml file 
     */
    static async GetNewAsync(path:string) {
        const response = await fetch(path);
        const dml = await response.text();
        return new DialogueQueue(dml); 
    }


    characters:Character[] = [];

    queue:Task[] = [];


    /**
     * @param dml Dialogue markup language to parse  
     */
    constructor (dml:string) {

        // NOTE: only character nodes can exist at root level
        // all other node types will be ignored

        this.characters = Character.GetCharacters(dml);    
        console.log(this.characters);

        //console.log(JSON.stringify(this.characters, null, 4));
        
        /*this.characters?.forEach(character => {
            this.#processNode(character);
        });*/
    }


   
    #processAbstract(node:ContainerNode|TextNode) {
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
                if (face.src != node.face) {
                    face.src = node.face;
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
            node.children.forEach(child => this.#processAbstract(child));        

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
            if (!node.speed || node.speed <= 0) {
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


    private reset (character:Character, dialogue:Dialogue) {
        // TODO: ".dialogue" will need to be a configurable selector
        $target = $dialogue.find(".text").html("");

        /** @type {Task[]} */
        this.queue = []; 

        if (dialogue?.nodes?.length) {
            for (let node of dialogue.nodes) {
                this.#processAbstract(node);
            }
        } 

        $dialogue
        .addClass("active")
        .find(".name").text(character.name);


        // #region EVENTS
        $dialogue
            .off()
            // clicking dialogue instantly finishes
            .on("click", () => {
                soundEnabled = false;
                this.queue.forEach(q => q.instant = true);

                $dialogue.off("click").on("click", () => {
                    if (dialogue.next) {
                        this.start(dialogue.next.character, dialogue.next.index);
                    }
                })
            })
        //#endregion

        const processQueue = async () => {
            if (!this.queue.length) {
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

    /**
     * Builds up a task queue for the specified character/dialogue and then execute its in sequence
     * @param characterName name of the character thats talking 
     * @param dialogueIndex index of the dialogue within this characters dialogue collection
     */
    start(characterName:string, dialogueIndex:any) {
   
        // finding character by name
        const _characters = this.characters.filter(c => c.name == characterName);
        if (!_characters?.length || _characters.length != 1) {
            console.error("Error starting dialogue: 0 or many characters where found with name \"" + characterName + "\".");
            return;
        }
        const character = _characters[0];


        // retrieving dialogue by index
        if (!character.dialogues || !character.dialogues.length || dialogueIndex > character.dialogues.length || dialogueIndex < 0) {
            console.error("Error starting dialogue: invalid dialogue index ", {
                lookingFor: dialogueIndex,
                numDialogues: character.dialogues?.length
            });
            return;
        }

        const dialogue = character.dialogues[dialogueIndex];
    
        // refresh queue
        this.reset(character, dialogue);

        console.log("QUEUE: ", this.queue);

    }


};


/** 
    @typedef {Object} Task
    @property {string} title
    @property {Function} [func]
    @property {boolean} [instant]
    @property {number} [delay]

*/

