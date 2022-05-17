



 export interface SoundOptions {
    alias?:string
    name?:string;
}

/**
 * Ion.Sound
 * version 3.0.7 Build 89
 * © Denis Ineshin, 2016
 *
 * Project page:    http://ionden.com/a/plugins/ion.sound/en.html
 * GitHub page:     https://github.com/IonDen/ion.sound
 *
 * Released under MIT licence:
 * http://ionden.com/a/plugins/licence-en.html
 */


function extend(parent:any, child:any = {}) {
    var prop;

    for (prop in parent) {
        if (parent.hasOwnProperty(prop)) {
            child[prop] = parent[prop];
        }
    }

    return child;
};



if (typeof Audio !== "function" && typeof Audio !== "object" || !("AudioContext" in window)) {
    console.error("Browser doesnt support Audio.");

}



/**
 * CORE
 * - creating sounds collection
 * - public methods
 */

var is_iOS = /iPad|iPhone|iPod/.test(navigator.appVersion),
    sounds_num = 0,
    settings:any = {};


let sounds:Record<string,Sound> = {};






function createSound(obj:SoundOptions) {
    var name = obj.alias || obj.name;

    if (!sounds[name]) {
        sounds[name] = new Sound(obj);
        sounds[name].init();
    }
};




const audio = new AudioContext();



class Sound {

    options:any;

    request:XMLHttpRequest;
    streams:Record<string,Stream>;
    url:string;
 
    loaded = false;
    decoded = false;
    no_file = false;
    autoplay = false;

    result:XMLHttpRequest;
    
    
    constructor (options:SoundOptions) {
        this.options = extend(settings);
        delete this.options.sounds;

        extend(options, this.options);

        this.request = null;
        this.streams = {};
        this.result = null;
        this.url = "";


    }

    init (options = {}) {
        if (options) {
            extend(options, this.options);
        }

        if (this.options.preload) {
            this.load();
        }
    }

    destroy () {
        var stream;

        for (let i in this.streams) {
            stream = this.streams[i];

            if (stream) {
                stream.destroy();
                stream = null;
            }
        }
        this.streams = {};
        this.result = null;
        this.options.buffer = null;
        this.options = null;

        if (this.request) {
            this.request.removeEventListener("load", this.ready.bind(this), false);
            this.request.removeEventListener("error", this.error.bind(this), false);
            this.request.abort();
            this.request = null;
        }
    }



    load () {
        if (this.no_file) {
            console.error("No sources for \"" + this.options.name + "\" sound :(");
            return;
        }

        if (this.request) {
            return;
        }



        this.url = this.options.path + encodeURIComponent(this.options.name);
        this.request = new XMLHttpRequest();
        this.request.open("GET", this.url, true);
        this.request.responseType = "arraybuffer";
        this.request.addEventListener("load", this.ready.bind(this), false);
        this.request.addEventListener("error", this.error.bind(this), false);

        this.request.send();
    }

    ready (data:ProgressEvent<XMLHttpRequestEventTarget>) {
        this.result = <XMLHttpRequest>data.target;
        
        if (this.request.readyState !== 4) {
            this.load();
            return;
        }

        if (this.request.status !== 200 && this.request.status !== 0) {
            console.error(this.url + " was not found on server!");
            return;
        }

        this.request.removeEventListener("load", this.ready.bind(this), false);
        this.request.removeEventListener("error", this.error.bind(this), false);
        this.request = null;
        this.loaded = true;

        this.decode();
    }

    decode () {
        if (!audio) {
            return;
        }

        audio.decodeAudioData(this.result.response, this.setBuffer.bind(this), this.error.bind(this));
    }

    setBuffer (buffer:any[]) {
        this.options.buffer = buffer;
        this.decoded = true;

        var config = {
            name: this.options.name,
            alias: this.options.alias,
            duration: this.options.buffer.duration
        };

        if (this.options.ready_callback && typeof this.options.ready_callback === "function") {
            this.options.ready_callback.call(this.options.scope, config);
        }

        if (this.options.sprite) {

            for (let i in this.options.sprite) {
                this.options.start = this.options.sprite[i][0];
                this.options.end = this.options.sprite[i][1];
                this.streams[i] = new Stream(this.options, i);
            }

        } else {

            this.streams[0] = new Stream(this.options);

        }

        if (this.autoplay) {
            this.autoplay = false;
            this.play();
        }
    }

    error () {
        this.load();
    }

    play (options = {}) {
        delete this.options.part;

        if (options) {
            extend(options, this.options);
        }

        if (!this.loaded) {
            this.autoplay = true;
            this.load();

            return;
        }

        if (this.no_file || !this.decoded) {
            return;
        }

        if (this.options.sprite) {
            if (this.options.part) {
                this.streams[this.options.part].play(this.options);
            } else {
                for (let i in this.options.sprite) {
                    this.streams[i].play(this.options);
                }
            }
        } else {
            this.streams[0].play(this.options);
        }
    }

    stop (options:any) {
        if (this.options.sprite) {

            if (options) {
                this.streams[options.part].stop();
            } else {
                for (let i in this.options.sprite) {
                    this.streams[i].stop();
                }
            }

        } else {
            this.streams[0].stop();
        }
    }

    pause (options:any) {
        if (this.options.sprite) {

            if (options) {
                this.streams[options.part].pause();
            } else {
                for (let i in this.options.sprite) {
                    this.streams[i].pause();
                }
            }

        } else {
            this.streams[0].pause();
        }
    }

    volume (options:any = null) {
        var stream;

        if (options) {
            extend(options, this.options);
        } else {
            return;
        }

        if (this.options.sprite) {
            if (this.options.part) {
                stream = this.streams[this.options.part];
                stream && stream.setVolume(this.options);
            } else {
                for (let i in this.options.sprite) {
                    stream = this.streams[i];
                    stream && stream.setVolume(this.options);
                }
            }
        } else {
            stream = this.streams[0];
            stream && stream.setVolume(this.options);
        }
    }
}


interface IBuffer {
    duration:number;

}
interface StreamOptions {
    alias:any;
    name:string;
    buffer:IBuffer;
    start:number;
    end?:number;
    multiplay:boolean;
    volume:number;
    scope:any;
    ended_callback: () => void;
}


class Stream{
    alias:any;
    name:string;
    sprite_part:any;
    buffer:IBuffer;
    start:number;
    end:number;
    multiplay:boolean;
    volume:number;
    scope:any;
    ended_callback: () => void;
    source:any;
    gain:GainNode;
    playing:boolean;
    paused:boolean;
    time_started:number;
    time_ended:number;
    time_played:number;
    time_offset:number;
    loop:number;

    constructor (options:StreamOptions, sprite_part = {}) {
        this.alias = options.alias;
        this.name = options.name;
        this.sprite_part = sprite_part;

        this.buffer = options.buffer;
        this.start = options.start || 0;
        this.end = options.end || this.buffer.duration;
        this.multiplay = options.multiplay || false;
        this.volume = options.volume || 1;
        this.scope = options.scope;
        this.ended_callback = options.ended_callback;

        this.setLoop(options);

        this.source = null;
        this.gain = null;
        this.playing = false;
        this.paused = false;

        this.time_started = 0;
        this.time_ended = 0;
        this.time_played = 0;
        this.time_offset = 0;
    }

    destroy () {
        this.stop();

        this.buffer = null;
        this.source = null;

        this.gain && this.gain.disconnect();
        this.source && this.source.disconnect();
        this.gain = null;
        this.source = null;
    }

    setLoop (options:any) {
        // infinite loop actually only loops 9999999 times... might want to redo this
        if (options.loop === true) {
            this.loop = 9999999;
        } 
        else if (typeof options.loop === "number") {
            this.loop = +options.loop - 1;
        } 
        else {
            this.loop = 0;
        }
    }

    update (options:any) {
        this.setLoop(options);
        if ("volume" in options) {
            this.volume = options.volume;
        }
    }

    play (options:any = {}) {
        if (options) {
            this.update(options);
        }

        if (!this.multiplay && this.playing) {
            return;
        }

        this.gain = audio.createGain();
        this.source = audio.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.connect(this.gain);
        this.gain.connect(audio.destination);
        this.gain.gain.value = this.volume;

        this.source.onended = this.ended.bind(this);

        this._play();
    }

    _play () {
        var start,
            end;

        if (this.paused) {
            start = this.start + this.time_offset;
            end = this.end - this.time_offset;
        } else {
            start = this.start;
            end = this.end;
        }

        if (end <= 0) {
            this.clear();
            return;
        }

        this.source.start(0, start, end);
        

        this.playing = true;
        this.paused = false;
        this.time_started = new Date().valueOf();
    }

    stop () {
        if (this.playing && this.source) {
            this.source.stop(0);
        }

        this.clear();
    }

    pause () {
        if (this.paused) {
            this.play();
            return;
        }

        if (!this.playing) {
            return;
        }

        this.source && this.source.stop(0);
        this.paused = true;
    }

    ended () {
        this.playing = false;
        this.time_ended = new Date().valueOf();
        this.time_played = (this.time_ended - this.time_started) / 1000;
        this.time_offset += this.time_played;

        if (this.time_offset >= this.end || this.end - this.time_offset < 0.015) {
            this._ended();
            this.clear();

            if (this.loop) {
                this.loop--;
                this.play();
            }
        }
    }

    _ended () {
        var config = {
            name: this.name,
            alias: this.alias,
            part: this.sprite_part,
            start: this.start,
            duration: this.end
        };

        if (this.ended_callback && typeof this.ended_callback === "function") {
            this.ended_callback.call(this.scope, config);
        }
    }

    clear () {
        this.time_played = 0;
        this.time_offset = 0;
        this.paused = false;
        this.playing = false;
    }

    setVolume (options:any) {
        this.volume = options.volume;

        if (this.gain) {
            this.gain.gain.value = this.volume;
        }
    }
}




export function sound (options:any) {
    extend(options, settings);

    settings.path = settings.path || "";
    settings.volume = settings.volume || 1;
    settings.preload = settings.preload || false;
    settings.multiplay = settings.multiplay || false;
    settings.loop = settings.loop || false;
    settings.sprite = settings.sprite || null;
    settings.scope = settings.scope || null;
    settings.ready_callback = settings.ready_callback || null;
    settings.ended_callback = settings.ended_callback || null;

    sounds_num = settings.sounds.length;

    if (!sounds_num) {
        console.error("No sound-files provided!");
        return;
    }

    for (let i = 0; i < sounds_num; i++) {
        createSound(settings.sounds[i]);
    }
}

sound._method = function (method:string, name:string, options:any = {}) {
    if (name) {
        // @ts-ignore
        sounds[name] && sounds[name][method](options);
    } 
    else {
        for (let i in sounds) {
            if (!sounds.hasOwnProperty(i) || !sounds[i]) {
                continue;
            }

            // @ts-ignore
            sounds[i][method](options);
        }
    }
}

sound.preload = function (name:string, options:any) {
    options = options || {};
    extend({preload: true}, options);

    this._method("init", name, options);
}

sound.destroy = function (name:string) {
    this._method("destroy", name);

    if (name) {
        sounds[name] = null;
    } else {
        for (let i in sounds) {
            if (!sounds.hasOwnProperty(i)) {
                continue;
            }
            if (sounds[i]) {
                sounds[i] = null;
            }
        }
    }
}

sound.play = function (name:string, options:any = {}) {
    this._method("play", name, options);
}

sound.stop = function (name:string, options:any = {}) {
    this._method("stop", name, options);
}

sound.pause = function (name:string, options:any = {}) {
    this._method("pause", name, options);
}

sound.volume = function (name:string, options:any = {}) {
    this._method("volume", name, options);
}


