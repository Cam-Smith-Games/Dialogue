// TODO: might want settings like volume, duration, loop, etc
export class SoundPlayer {
    /** @param src file path relative to SoundPlayer.ROOT_PATH
     * @param count number of instances to add (more = more memory, but allows overlap for faster playback)*/
    static async Add(src, count = 1) {
        SoundPlayer._Add(src, count, SoundPlayer.GetList(src));
    }
    static async _Add(src, count, list) {
        let sounds = await this.loadMultiple(SoundPlayer.ROOT_PATH + "/" + src, count);
        list.push(...sounds);
        return list;
    }
    static async _AddSingle(src, list) {
        let sound = await this.loadSingle(SoundPlayer.ROOT_PATH + "/" + src);
        list.push(sound);
        return sound;
    }
    static GetList(src) {
        if (src in SoundPlayer.sounds) {
            return SoundPlayer.sounds[src];
        }
        return SoundPlayer.sounds[src] = [];
    }
    static async loadSingle(src) {
        return await new Promise((resolve, _reject) => {
            var audio = new Audio();
            audio.onload = () => resolve(audio);
            audio.src = src;
        });
    }
    static async loadMultiple(src, count) {
        return await Promise.all(new Array(count).map(() => this.loadSingle(src)));
    }
    // TODO: setting to max instances, when max instances are added, modulo them
    //         index = ++index % sounds.length;
    static async GetSound(src) {
        let list;
        if (src in SoundPlayer.sounds) {
            list = SoundPlayer.sounds[src];
            for (let i = 0; i < list.length; i++) {
                let s = list[i];
                if (!s.paused) {
                    return s;
                }
            }
            console.log("WARNING: playback delayed due to insufficient sound instances");
        }
        else {
            list = SoundPlayer.sounds[src] = [];
            console.log("WARNING: playback delated due to sound not being preloaded. You should call Sound.Add prior to Sound.Play");
        }
        return await SoundPlayer._AddSingle(src, list);
    }
    static Toggle() { this.Enabled = !this.Enabled; }
    static async Play(src) {
        if (this.Enabled) {
            let sound = await this.GetSound(src);
            sound.play();
            return sound;
        }
        return null;
    }
}
SoundPlayer.ROOT_PATH = "assets/sound";
SoundPlayer.Enabled = true;
//# sourceMappingURL=sound.js.map