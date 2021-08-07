import { emojis, Dialogue } from "./modules/dialogue.js";

const nodes = [
    {
        children: [
            {
                text: "Dude, you'll never believe this. ",
                speed: 1.5
            },
            {
                emojis: [emojis.crying, emojis.crying, emojis.hundred],
            }
        ],
        newLine: true
    },  
    {
        text: "My balls",
        speed: 1,
        delay: 500
    },
    {
        text: "... ",
        speed: 0.5
    },       
    {
        text: "They're gone. ",
        emojis: [emojis.no],
        speed: 1.25,
    },
    {
        children: [
            {
                delay: 1000,
                text: "I just woke up, ",
                speed: 1.5
            },
            {
                text: "and the'yre "
            },
            {
                text: "FUCKING ",
                color: "red"
            },
            {
                text: "gone... "
            }
        ],
        newLine: true
    },
    {
        newLine: true,
        children: [{
                delay: 1000,
                text: "I'm",
                speed: 1.25
            },
            {
                delay: 1000,
                text: " I-",
                speed: 0.5
            },
            {
                delay: 1000,
                text: "I guess that makes me a...",
                speed: 1
            },
            {
                children: [
                    {
                        text: " faggot ",
                        speed: 0.25
                    }, 
                    {
                        emojis: [emojis.flushed]
                    }
                ],            
                classes: ["italic"],
                color: "pink",
            }
        ]
    }
];


var dialogue = new Dialogue(nodes);


$("#btnStart").on("click", () => {
    dialogue.start();
});