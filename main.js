import DialogueQueue from "./classes/Queue.js";


DialogueQueue.GetNewAsync("dialogues/dialogue1.html")
.then(queue => {
    $("#btnStart").on("click", () => {
        queue.start("Smiley", 0);
    });
});
