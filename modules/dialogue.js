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
 * @property [color] {string} text color 
 * @property [classes] {string[]} CSS classes to apply to this node (will effect child nodes)
 * @property [speed] {number} speed to run through this nodes text
 * @property [emojis] {number[]}
 * @property [delay] {number} number of milliseconds to wait before processing this node
 * @property [block] {boolean} determines whether to display as block or inline
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

    /** @param {DialogueNode} root */
    constructor(root) {
        this.root = root;
        this.#processNode(root);
    }


    /** generates task queue by recursively processing nodes
     * @param {DialogueNode} node */
    #processNode (node) {
        // #region ACTIVATING GROUP EFFECTS

        // if newline OR color effect, add html container element 
        if (node.block || node.color) {
            this.queue.push({
                func: () => {
                    let type = node.block ? "div" : "span";
                    let color = node.color ? (" style='color:" + node.color + "'") : "";
                    let classes = "";
                    if (node.classes?.length) {
                        classes = " class='" + node.classes.join(" ") + "' ";
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

        // #region APPENDING TEXT 
        if (node.text && node.text.length > 0) {
            // instant nodes get text applied in one chunk
            if (node.instant) {
                this.queue.push({
                    func: () => {
                        $target.append(node.text);
                        playBeep();
                    }
                })
            }
            // non-instant nodes get separate task for each char
            else {
                node.text.split("").forEach(char => this.queue.push({
                    func: () => {
                        //console.log(char);
                        //console.log("appending: " + char);
                        $target.append(char);
    
                        // TODO: pass voice
                        if (!node.instant && char && char != "" && char != " ") {
                            playBeep();
                        }
                    }
                }));
            }
        }
        // #endregion  
        
        // #region RECURSION
        if (node.children && node.children.length) {
            node.children.forEach(child => {
                this.#processNode(child);
            });
        }
        // #endregion 

        // #region DEACTIVATING GROUP EFFECTS
        // if newline OR color effect, exit html container element 
        if (node.block || node.color) {
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


    /** @param {Element} elem 
    *  @returns {DialogueNode} */
    static parseNode(elem) {

        /** @type {DialogueNode} */
        const node = {};

        // #region extracting properties from node type 
        const type = elem.nodeName;
        if (type == "BLOCK") {
            node.block = true;
        }
        if (type == "I") {
            node.instant = true;
        }
        // #endregion
        

        // #regon extracting text
        // to ignore text within children, have to clone and remove children before retrieving text
        //let text = $elem.clone().children().remove().end().text();
        if (elem.childNodes?.length) {
            const text = elem.childNodes[0].textContent;
            // NOTE: not actually trimiming the text, only checking trim to make sure its not white space ONLY
            if (text && text.trim()) {
                //text = text.trim();
                node.text = text;    
            }
        }
        // #endregion

        // #region parsing attributes
        if (elem.attributes?.length) {
            for (let i=0; i<elem.attributes.length; i++) {
                let attr = elem.attributes[i];

                // @ts-ignore
                node[attr.name]
                = numberProperties.includes(attr.name) ? Number(attr.value) 
                : attr.value == "" ? true 
                : attr.value;
                
            }
        }
        // #endregion


        // #region recursively parsing children
        if (elem.children?.length) {
            node.children = [];
            for (let i=0; i<elem.children.length; i++) {
                node.children.push(Dialogue.parseNode(elem.children[i]));
            }
        }
        // #endregion

        return node;
    }
};

const numberProperties = ["delay", "speed"];









