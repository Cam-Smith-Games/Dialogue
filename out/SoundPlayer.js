// TODO: might want settings like volume, duration, loop, etc
export class SoundPlayer {
    /** @param src file path relative to SoundPlayer.ROOT_PATH
     * @param count number of instances to add (more = more memory, but allows overlap for faster playback)*/
    static async Add(args) {
        if (args.src in SoundPlayer.channels) {
            // TODO: could add more to existing list. or update properties
            console.log("attempted to add a sound that's already been added");
            return;
        }
        let path = SoundPlayer.ROOT_PATH + "/" + args.src;
        let sounds = await SoundPlayer.loadMultiple(path, args.count || 1);
        SoundPlayer.channels[args.src] = new Sound(sounds, args);
    }
    static loadSingle(src) {
        var wtf = new Promise((resolve, _reject) => {
            var audio = document.createElement("audio");
            audio.oncanplay = () => resolve(audio);
            audio.src = src;
        });
        return wtf;
    }
    static loadMultiple(src, count) {
        let promises = [];
        for (let i = 0; i < count; i++) {
            promises.push(this.loadSingle(src));
        }
        return Promise.all(promises);
    }
    static Toggle() { this.Enabled = !this.Enabled; }
    static async Play(src) {
        if (this.Enabled) {
            if (src in this.channels) {
                return this.channels[src].play();
            }
            console.log("WARNING: attempted to play sound that has not be pre-loaded: ", src);
        }
        return null;
    }
}
SoundPlayer.ROOT_PATH = "/assets/sound";
SoundPlayer.channels = {};
SoundPlayer.Enabled = true;
class Sound {
    constructor(sounds, args) {
        this.sounds = [];
        this.sounds = sounds || [];
        this.max_frequency = args.delay;
    }
    getSound() {
        for (let s of this.sounds) {
            if (s.paused) {
                return s;
            }
        }
        // TODO: if "reset" flag is set, cancel and restart at some index
        return null;
    }
    update(args) {
        this.max_frequency = args.delay;
    }
    play() {
        let now;
        if (this.max_frequency) {
            now = performance.now();
            if (this.last_time) {
                let dt = now - this.last_time;
                if (dt < this.max_frequency) {
                    return;
                }
            }
        }
        let sound = this.getSound();
        if (sound) {
            sound.play();
            this.last_time = now || performance.now();
        }
    }
}
//# sourceMappingURL=SoundPlayer.js.map