
// TODO: might want settings like volume, duration, loop, etc
export class SoundPlayer {

    public static ROOT_PATH:string = "/assets/sound";

    /** @param src file path relative to SoundPlayer.ROOT_PATH
     * @param count number of instances to add (more = more memory, but allows overlap for faster playback)*/
    public static async Add(args:ISoundArgs) {
        if (args.src in SoundPlayer.channels) {
            // TODO: could add more to existing list. or update properties
            console.log("attempted to add a sound that's already been added");
            return;
        } 

        let path = SoundPlayer.ROOT_PATH + "/" + args.src;
        let sounds = await SoundPlayer.loadMultiple(path, args.count || 1);
        SoundPlayer.channels[args.src] = new Sound(sounds, args);
    }

    private static channels:Record<string,Sound> = {};  
    private static loadSingle(src:string):Promise<HTMLAudioElement> {
        var wtf = new Promise<HTMLAudioElement> ((resolve, _reject) => {
            var audio = document.createElement("audio");
            audio.oncanplay = () => resolve(audio);
            audio.src = src;
        });
        return wtf;
    }
    private static loadMultiple(src:string, count:number) {
        let promises:Promise<HTMLAudioElement>[] = [];
        for (let i = 0; i < count; i ++) {
            promises.push(this.loadSingle(src));
        }
        return Promise.all(promises);
    }



    public static Enabled = true;
    public static Toggle() { this.Enabled = !this.Enabled; }
    public static async Play(src:string) {
        if (this.Enabled) {
            if (src in this.channels) {
                return this.channels[src].play();
            }
            console.log("WARNING: attempted to play sound that has not be pre-loaded: ", src);
        }

        return null;
    }


}


export interface ISound {
    src:string;

    /** prevents sound from being played too fast. (play attempts will get rejected if last play was too recent)  */
    delay?: number;

    // TODO: setting whether to cancel restart a sound when no channels are availabnle, or just reject the play request

}

export interface ISoundArgs extends ISound {
    /** number of instances to load (allows playing faster by overlapping multiple channels) */
    count?: number;
}

class Sound  {

    sounds:HTMLAudioElement[] = [];
    max_frequency?: number;

    constructor(sounds:HTMLAudioElement[], args:ISound) {
        this.sounds = sounds || [];
        this.max_frequency = args.delay;
    }

    private getSound() {
        for (let s of this.sounds) {
            if (s.paused) {
                return s;
            }
        }

        // TODO: if "reset" flag is set, cancel and restart at some index
        return null;
    }

    update(args:ISound) {
        this.max_frequency = args.delay;
    }


    private last_time:number;
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