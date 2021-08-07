import *  as ion from "./ion.sound.js";
export { emojis, Dialogue }

//
//  TODO:
//      give dialogue elements a func to invoke if they want
//      this would be hard to implement for server-side game, but fine for single player
//      only downside is we can't export the func to json
//      only way to export the custom funcs to json would be use a unique ID for each func and just store the id in json
//      however, this would quickly lead to a big ugly of functions that are separated from their relative dialogues
//      not only that, but it would quickly become hard to maintain unique ids as the list gets larger and larger.


/** @enum {number} */
const emojis = {
    crying: 0x1F62D,
    hundred: 0x1F4AF,
    no: 0x1F645,
    flushed: 0x1F633
}

/** @typedef {Object} DialogueNode
 * @property [children] {DialogueNode[]}
 * @property [text] {string}
 * @property [color] {string}
 * @property [classes] {string[]}
 * @property [speed] {number}
 * @property [emojis] {number[]}
 * @property [delay] {number}
 * @property [newLine] {boolean}
 * @property [instant] {boolean}
 */

/** @typedef {Object} Task
 * @property [func] {Function}
 * @property [instant] {boolean}
 * @property [delay] {number}
 */


// #region SOUND
/** @type { import('./ion.sound').SoundOptions[]} */
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
    path: "sound/",
    ext: "ogg",
    preload: true,
    multiplay: true
});

let soundEnabled = true;
let index = 0;
function playBeep () {
    if (soundEnabled) {
        index = ++index % sounds.length;
        ion.sound.play(sounds[index].alias);
    }
}
// #endregion




// speed = number of blips per second
// this speed gets multiplier by speed_mult before being applied, speed_mult varies based on which node were in. 
// due to nested structure, the multiplier is necessary to multiply inware and then divide back out of a child node.
const speed = 15;
let speed_mult = 1;

let $target = $(".dialogue").find(".text");


class Dialogue  {

    /** @type Task[] */
    queue = [];

    /** @type DialogueNode[] */
    nodes = [];

    /** @param {DialogueNode[]} nodes */
    constructor(nodes) {
        this.nodes = nodes;
        this.#init();
    }

    #init() {
        // #region CREATING QUEUE
        /** @param {DialogueNode} node */
        const processNode = (node) => {
            // #region ACTIVATING GROUP EFFECTS

            // if newline OR color effect, add html container element 
            if (node.newLine || node.color) {
                this.queue.push({
                    func: () => {
                        let type = node.newLine ? "div" : "span";
                        let color = node.color ? (" style='color:" + node.color + "'") : "";
                        let classes = "";
                        if (node.classes && node.classes.length > 0) {
                            classes = " class='";
                            node.classes.forEach(c => {
                                classes += c + " ";
                            });
                            classes += "' ";
                        }
                        $target = $("<" + type + classes + color + "></" + type + ">").appendTo($target);
                    },
                    instant: true
                });
            }

            if (node.delay) {
                this.queue.push({
                    delay: node.delay
                });
            }
            if (node.speed) {
                this.queue.push({
                    func: () => {
                        speed_mult *= node.speed;
                        //console.log("multiplying speed by " + node.speed + " => " + speed_mult);
                    }
                });
            }
            // #endregion

            // #region RECURSION
            if (node.children && node.children.length > 0) {
                node.children.forEach(child => {
                    processNode(child);
                });
            }
            // #endregion 

            // #region APPENDING TEXT 
            if (node.text && node.text.length > 0) {
                node.text.split("").forEach(char => this.queue.push({
                    func: () => {
                        //console.log("appending: " + char);
                        $target.append(char);
                        // TODO: pass voice
                        if (!node.instant && char && char != "" && char != " ") {
                            playBeep();
                        }
                    }
                }));
            }
            if (node.emojis && node.emojis.length > 0) {
                this.queue.push({
                    func: () => {
                        //console.log("appending: " + char);
                        node.emojis.forEach(emoji => {
                            $target.append(String.fromCodePoint(emoji));
                        });
                    }
                })
            }
            // #endregion  

            // #region DEACTIVATING GROUP EFFECTS
            // if newline OR color effect, exit html container element 
            if (node.newLine || node.color) {
                this.queue.push({
                    func: () => {
                        $target = $target.parent();
                    },
                    instant: true
                });
            }

            if (node.speed) {
                this.queue.push({
                    func: () => {
                        speed_mult /= node.speed;
                        //console.log("dividing speed by " + node.speed + " => " + speed_mult);
                    }
                });
            }
            // #endregion
        }
        this.nodes.forEach(node => processNode(node));
        // #endregion

    }


    start() {

        
        // #region EVENTS
        $(".dialogue")
            // clicking dialogue instantly finishes
            .on("click", () => {
                soundEnabled = false;
                this.queue.forEach(q => q.instant = true);
            })
            // animate arrow (this should be done with css by toggling a class...)
            .find(".arrow").show().find("i").animate(
                [{ left: '0' }, { left: '10px' }, { left: '0' }], 
                {
                    duration: 700,
                    iterations: Infinity
                }
            );
        //#endregion

        const processQueue = () => {
            if (!this.queue.length) {
                soundEnabled = true;
                $("#text").find(".arrow").show();
                return;
            }
        
            const task = this.queue.shift();
        
            function proceed () {
                if (task.func) {
                    task.func();
                }
                processQueue();
            }
            
            if (task.instant) {
                proceed();
            }
            else {
                let delay = (task.delay ? task.delay : 0) +  (1000 / (speed * speed_mult))
                //console.log("%cdelay: " + delay, "color:gray");
                setTimeout(proceed, delay);
            }
        }  

        processQueue();
    }

};










