import { Dialogue } from "./Dialogue.js";
(async function () {
    let dialogue = await Dialogue.fetch("adrian_graem");
    $("#btnStart").on("click", () => {
        dialogue.start(0);
    });
}());
/**
 * TODO:
 *
 * - dml file extension. vscode should support setting syntax to html if necessary
 *
 * - nameplate background image
 *
 *
 * - custom styling:
 *      - use required CSS variables that each game would have to set
 *          - @background-img
 *          - @title-img
 *          - @portrait-background
 *          - etc...
 *      - some of these settings might only be applicable if certain settings are set, but we'll see
 *
 *
 * - anchor setting? i.e. anchor to bottom, top, left, etc. modifyting anchor will update css class
 *
 * - shake effect?
 *      - ideally would be nice to completely shake the canvas, but this would be kinda complicated
 *      - maybe just shake the portrait?
 *
 * - script IDs to execute custom scripts
 *      - this might already exist
 *      - i.e. a common script ID could be "reward" which would somehow call a function that rewards player with request reward and ends the dialogue
 *
 * - portrait should be canvas for rendering spritesheet
 *
 * - BUILD A GOOD EXAMPLE FOR GITHUB PRIOR TO EXPORTING TO SUSSY ENGINE
 *      - get a sprite with multiple facial expressions
 *          - expression needs to change mid-sentence to match current mood
 *          - in order to prevent timing issues, should probably preload images
 *          - research if electron loads images instantly
 *
 */ 
//# sourceMappingURL=main.js.map