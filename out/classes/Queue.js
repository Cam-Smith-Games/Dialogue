var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _DialogueQueue_instances, _DialogueQueue_processAbstract, _DialogueQueue_processContainer, _DialogueQueue_processText, _DialogueQueue_reset;
import * as ion from "../modules/ion.sound.js";
import Character from "./Character.js";
import ContainerNode from "./nodes/ContainerNode.js";
// #region SOUND
/** @type { import('../modules/ion.sound').SoundOptions[]} */
// storing same sound multiples (distinguished by alias) so we can play them super fast
let sounds = [];
for (var i = 1; i <= 15; i++) {
    sounds.push({
        name: "boop.ogg",
        alias: "boop_" + i
    });
}
ion.sound({
    sounds: sounds,
    path: "res/sound/",
    ext: "ogg",
    preload: true,
    multiplay: true
});
let soundEnabled = true;
let index = 0;
function playBeep() {
    if (soundEnabled) {
        index = ++index % sounds.length;
        ion.sound.play(sounds[index].alias);
    }
}
// #endregion
// speed = number of blips per second
let speed = 15;
/** @type {JQuery<HTMLElement>} */
let $target;
const $dialogue = $(".dialogue");
/** @type {HTMLImageElement} */
// @ts-ignore
const face = $dialogue.find(".profile img").get(0);
export default class DialogueQueue {
    /**
     * @param {string} dml Dialogue markup language to parse
     */
    constructor(dml) {
        // NOTE: only character nodes can exist at root level
        // all other node types will be ignored
        _DialogueQueue_instances.add(this);
        /** @type {Character[]} */
        this.characters = [];
        /** @type Task[] */
        this.queue = [];
        this.characters = Character.GetCharacters(dml);
        console.log(this.characters);
        //console.log(JSON.stringify(this.characters, null, 4));
        /*this.characters?.forEach(character => {
            this.#processNode(character);
        });*/
    }
    /**
     * @param {string} path file path to dml file
     */
    static async GetNewAsync(path) {
        const response = await fetch(path);
        const dml = await response.text();
        return new DialogueQueue(dml);
    }
    /**
     * Builds up a task queue for the specified character/dialogue and then execute its in sequence
     * @param {string} characterName name of the character thats talking
     * @param {*} dialogueIndex index of the dialogue within this characters dialogue collection
     */
    start(characterName, dialogueIndex) {
        var _a;
        // finding character by name
        const _characters = this.characters.filter(c => c.name == characterName);
        if (!(_characters === null || _characters === void 0 ? void 0 : _characters.length) || _characters.length != 1) {
            console.error("Error starting dialogue: 0 or many characters where found with name \"" + characterName + "\".");
            return;
        }
        const character = _characters[0];
        // retrieving dialogue by index
        if (!character.dialogues || !character.dialogues.length || dialogueIndex > character.dialogues.length || dialogueIndex < 0) {
            console.error("Error starting dialogue: invalid dialogue index ", {
                lookingFor: dialogueIndex,
                numDialogues: (_a = character.dialogues) === null || _a === void 0 ? void 0 : _a.length
            });
            return;
        }
        const dialogue = character.dialogues[dialogueIndex];
        // refresh queue
        __classPrivateFieldGet(this, _DialogueQueue_instances, "m", _DialogueQueue_reset).call(this, character, dialogue);
        console.log("QUEUE: ", this.queue);
    }
}
_DialogueQueue_instances = new WeakSet(), _DialogueQueue_processAbstract = function _DialogueQueue_processAbstract(node) {
    if (node.delay) {
        this.queue.push({
            title: "delay: " + node.delay,
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
        __classPrivateFieldGet(this, _DialogueQueue_instances, "m", _DialogueQueue_processContainer).call(this, node);
    }
    else {
        __classPrivateFieldGet(this, _DialogueQueue_instances, "m", _DialogueQueue_processText).call(this, node);
    }
}, _DialogueQueue_processContainer = function _DialogueQueue_processContainer(node) {
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
        node.children.forEach(child => __classPrivateFieldGet(this, _DialogueQueue_instances, "m", _DialogueQueue_processAbstract).call(this, child));
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
}, _DialogueQueue_processText = function _DialogueQueue_processText(node) {
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
            node.text.split("").forEach(char => this.queue.push({
                title: "char: " + char,
                func: () => {
                    $target.append(char);
                    // TODO: pass voice
                    if (node.speed > 0 && (char === null || char === void 0 ? void 0 : char.trim())) {
                        playBeep();
                    }
                }
            }));
        }
    }
}, _DialogueQueue_reset = function _DialogueQueue_reset(character, dialogue) {
    var _a;
    // TODO: ".dialogue" will need to be a configurable selector
    $target = $dialogue.find(".text").html("");
    /** @type {Task[]} */
    this.queue = [];
    if ((_a = dialogue === null || dialogue === void 0 ? void 0 : dialogue.nodes) === null || _a === void 0 ? void 0 : _a.length) {
        for (let node of dialogue.nodes) {
            __classPrivateFieldGet(this, _DialogueQueue_instances, "m", _DialogueQueue_processAbstract).call(this, node);
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
};
;
/**
    @typedef {Object} Task
    @property {string} title
    @property {Function} [func]
    @property {boolean} [instant]
    @property {number} [delay]

*/
//# sourceMappingURL=Queue.js.map