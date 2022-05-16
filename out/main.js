import DialogueQueue from "./classes/Queue.js";
(async function () {
    let queue = await DialogueQueue.GetNewAsync("dialogues/dialogue1.html");
    $("#btnStart").on("click", () => {
        queue.start("Smiley", 0);
    });
}());
//# sourceMappingURL=main.js.map