import { emojis, Dialogue } from "./modules/dialogue.js";


// TODO: loader

fetch("dialogues/dialogue1.html")
.then(response => response.text())
.then(html => {
    const element = getElement(html);
    const root = Dialogue.parseNode(element);
    console.log(root);
    var dialogue = new Dialogue(root);
    $("#btnStart").on("click", () => {
        dialogue.start();
    });
})


/** @param {string} html */
function getElement(html) {
    const doc = document.createElement("div");
    doc.innerHTML = html;
    return doc.firstElementChild;
}

/** @typedef { import("./modules/dialogue.js").DialogueNode } DialogueNode */




// JSON METHOD:
/* fetch("dialogues/dialogue1.json")
.then(response => response.json())
.then(nodes => {
        console.log("NODES: ", nodes);

        var dialogue = new Dialogue(nodes);

        $("#btnStart").on("click", () => {
            dialogue.start();
        });
        
})*/
