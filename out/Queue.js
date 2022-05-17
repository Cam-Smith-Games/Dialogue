import Character from "./Character.js";
import { sound } from "./modules/ion.sound.js";
import ContainerNode from "./nodes/ContainerNode.js";
// #region SOUND
// storing same sound multiples (distinguished by alias) so we can play them super fast
let sounds = [];
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
function playBeep() {
    if (soundEnabled) {
        index = ++index % sounds.length;
        sound.play(sounds[index].alias);
    }
}
// #endregion
// speed = number of blips per second
let speed = 15;
let $target;
const $dialogue = $(".dialogue");
const face = $dialogue.find(".profile img").get(0);
export default class Dialogue {
    /** @param dml Dialogue markup language to parse  */
    constructor(dialogues) {
        this.nodes = [];
        this.queue = [];
        this.nodes = dialogues;
        console.log("DIALOGUE QUEUE: ", this.nodes);
    }
    processAbstract(node) {
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
        });
        if (node instanceof ContainerNode) {
            this.processContainer(node);
        }
        else {
            this.processText(node);
        }
    }
    processContainer(node) {
        var _a, _b;
        if ((_a = node === null || node === void 0 ? void 0 : node.children) === null || _a === void 0 ? void 0 : _a.length) {
            const classes = ((_b = node.classes) === null || _b === void 0 ? void 0 : _b.length) ? (" class='" + node.classes + "' ") : "";
            const color = node.color ? (" style='color:" + node.color + "'") : "";
            const html = "<" + node.type + classes + color + "></" + node.type + ">";
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
    processText(node) {
        var _a;
        // GENERATING TEXT
        if ((_a = node.text) === null || _a === void 0 ? void 0 : _a.length) {
            // instant nodes get text applied in one chunk
            if (!node.speed || node.speed <= 0) {
                this.queue.push({
                    title: "text (instant): " + node.text,
                    func: () => {
                        $target.append(node.text);
                        playBeep();
                    }
                });
            }
            // non-instant nodes get separate task for each char
            else {
                for (let char of node.text.split("")) {
                    this.queue.push({
                        title: "char: " + char,
                        func: () => {
                            $target.append(char);
                            // TODO: pass voice
                            if (node.speed > 0 && (char === null || char === void 0 ? void 0 : char.trim())) {
                                playBeep();
                            }
                        }
                    });
                }
            }
        }
    }
    async reset(node) {
        var _a;
        // TODO: ".dialogue" will need to be a configurable selector
        $target = $dialogue.find(".text").html("");
        /** @type {Task[]} */
        this.queue = [];
        if ((_a = node === null || node === void 0 ? void 0 : node.nodes) === null || _a === void 0 ? void 0 : _a.length) {
            for (let n of node.nodes) {
                this.processAbstract(n);
            }
        }
        let character = await node.getCharacter();
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
                if (node.next_index) {
                    this.start(node.next_index);
                }
            });
        });
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
                let delay = (task.delay ? task.delay : 0) + (1000 / speed);
                if (delay > 0) {
                    //console.log("%cdelay: " + delay, "color:gray");
                    await new Promise((resolve, _) => setTimeout(resolve, delay));
                }
            }
            if (task.func) {
                task.func();
            }
            processQueue();
        };
        processQueue();
    }
    /**
     * Builds up a task queue for the specified character/dialogue and then execute its in sequence
     * @param index index of the dialogue within this characters dialogue collection
     */
    start(index) {
        const node = this.nodes[index];
        if (!node) {
            console.error("failed to find dialogue node with index = ", index);
            return;
        }
        // refresh queue
        this.reset(node);
        console.log("QUEUE: ", this.queue);
    }
    /** @param path dml file path (must exist inside ROOT_PATH) */
    static async fetch(path) {
        let full_path = `${Dialogue.ROOT_PATH}/${path}.dml`;
        const response = await fetch(full_path);
        const dml = await response.text();
        return Dialogue.parse(dml);
    }
    /** parse DML into collection of dialogues
     * @note only dialogues nodes can exist at root level. all other node types will be ignored
     */
    static parse(dml) {
        const doc = $("<div>").append(dml).get(0);
        // @ts-ignore
        return AbstractNode.MapElements(doc, "dialogue", elem => new Character(elem));
    }
}
// #region static
/** root folder path for dialogue files */
Dialogue.ROOT_PATH = "dialogue";
;
//# sourceMappingURL=Queue.js.map