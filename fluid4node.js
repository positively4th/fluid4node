var ffi = require('ffi');
var ref = require('ref');

var FLUID_FAILED = -1;

var fluid_settings_t  = ref.refType(ref.types.void);
var fluid_synth_t = ref.refType(ref.types.void);
var fluid_audio_driver_t = ref.refType(ref.types.void);
var char_ptr  = ref.types.CString;

function Fluid4NodeError(message) {
    this.name = 'Fluid4NodeError';
    this.message = message;
    this.stack = (new Error()).stack;
}

var libSpec = {
    'new_fluid_settings': [ fluid_settings_t, [] ],
    'delete_fluid_settings': ['void', [fluid_settings_t]],
    'fluid_settings_setstr': ['int', [fluid_settings_t, char_ptr, char_ptr]],
    'new_fluid_synth': [fluid_synth_t, [fluid_settings_t]],
    'delete_fluid_synth': ['int', [fluid_synth_t]],
    'new_fluid_audio_driver': [fluid_audio_driver_t, [fluid_settings_t, fluid_synth_t]],
    'fluid_synth_sfload': ['int', [fluid_synth_t, char_ptr, 'int']],
    'fluid_synth_sfunload': ['int', [fluid_synth_t, 'int', 'int']],
    'fluid_synth_noteon': ['int', [fluid_synth_t, 'int', 'int', 'int']],
    'fluid_synth_noteoff': ['int', [fluid_synth_t, 'int', 'int']],
    'fluid_synth_program_change': ['int', [fluid_synth_t, 'int', 'int']],
    'fluid_synth_set_gain': [ 'void', [ fluid_synth_t, 'float'] ],
};

function initLib(libs) {
    var res = false;
    var i = 0;
    while (i < libs.length && !res) {
	try {
	    res = ffi.Library(libs[i++], libSpec);
	} catch (e) {
	    res = false;
	}
    }
    if (!res) {
	throw new Fluid4NodeError('Could not wrap any native library from list:' + libs.join(', '))
    };
    return res;
}

function initSynth(lib, settings, drivers) {
    var synth = lib.new_fluid_synth(settings);
    
    var res;
    var i = 0;
    while (i < drivers.length) {
	try {
	    lib.fluid_settings_setstr(settings, "audio.driver", drivers[i++]);
	    res = lib.new_fluid_audio_driver(settings, synth); '';
	    if (res.address()) {
		return synth;
	    }
	} catch (e) {
	};
    }
    throw new Fluid4NodeError('Could create sytnth with ant driver from:' + drivers.join(', '))
}

function initSoundFonts(lib, synth, soundFonts) {

    var res = {};
    return soundFonts.forEach(function (sfPath) {
	var sf2Id = lib.fluid_synth_sfload(synth, sfPath, 0);	
	
	if (res.hasOwnProperty(sfPath)) {
	    throw new Fluid4NodeError('Soundfont already loaded: ' + sfPath);
	}
	if (sf2Id === FLUID_FAILED) {
	    throw new Fluid4NodeError('Could load soundfont: ' + sfPath);
	}
	res[sfPath] = sf2Id;
    });
    console.log('soundFonts', res);
    return res;
}

module.exports = function(spec) {
    spec = spec || {};
    spec.drivers = spec.drivers || ['coremidi', 'dsound', 'jack', 'pulseaudio', 'alsa', 'winmidi', 'alsa_raw', 'alsa_seq'];
    spec.libs = spec.libs || [
	'libs/win/libfluidsynth.dll',
	'libs/linux/libfluidsynth.so.1'
    ];
    spec.soundFonts = spec.soundFonts || ['./sf2/FluidR3_GM.sf2'];

    var api = {
	FLUID_FAILED: FLUID_FAILED,
	getLib: function() {
	    return lib;
	}
    };
    
    var lib = initLib(spec.libs);
    if (spec.drivers.length > 0) {
	var settings = lib.new_fluid_settings();
	var synth = initSynth(lib, settings, spec.drivers);
	if (spec.soundFonts.length > 0) {
	    var soundFonts = initSoundFonts(lib, synth, spec.soundFonts);
	}
	api.setGain = function (gain) {
	    return lib.fluid_synth_set_gain(synth, gain);
	};
	api.programChange = function (chan, program) {
	    return lib.fluid_synth_program_change(synth, chan, program);
	};
	api.noteOn = function (chan, key, vel) {
	    lib.fluid_synth_noteon(synth, chan, key, vel);
	};
	api.noteOff = function (chan, key) {
	    lib.fluid_synth_noteoff(synth, chan, key);
	};
	api.destroy = function () {
	    for (key in soundFonts) {
		lib.fluid_synth_sfunload(synth, key, 0);	
	    }
	    lib.delete_fluid_synth(synth);
	    lib.delete_fluid_settings(settings);
	}
    }
	
    return api;
};
