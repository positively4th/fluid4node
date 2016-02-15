var os = require('os');
var path = require('path');
var ffi = require('ffi');
var ref = require('ref');


var osType = os.type();

var FLUID_FAILED = -1;

var char_ptr  = ffi.types.CString;
var void_ptr  = ref.refType(ffi.types.void);
var fluid_settings_t  = ref.refType(ffi.types.void);
var fluid_synth_t = ref.refType(ffi.types.void);
var fluid_audio_driver_t = ref.refType(ffi.types.void);
var fluid_settings_foreach_option_t = ref.refType(ffi.types.void);

function Fluid4NodeError(message) {
    this.name = 'Fluid4NodeError';
    this.message = message;
    this.stack = (new Error()).stack;
}

function relPath(locPath) {
    var res = path.normalize(__dirname + '/' + locPath);
    return res;
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
    'fluid_settings_foreach_option': ['void', [fluid_settings_t, char_ptr, void_ptr, fluid_settings_foreach_option_t]]
//    'fluid_settings_foreach_option': ['void', [fluid_settings_t, char_ptr, void_ptr, 'pointer']]
};

function initLib(libs) {
    var res = false;
    var i = 0;
    while (i < libs.length && !res) {
	try {
	    res = ffi.Library(relPath(libs[i++]), libSpec);
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

    var driverMask = {};
    lib.fluid_settings_foreach_option(settings, "audio.driver", null,
				      ffi.Callback('void', [void_ptr, char_ptr, char_ptr],
						   function (data, name, option) {
						       driverMask[option] = true;
						   })
				     );
    
    var res;
    var i = 0;
    var drv;
    while (i < drivers.length) {
	drv = drivers[i++];
	if (!driverMask[drv]) {
	    console.log('Unknown driver: ' + drv);
	    continue;
	}
	try {
	    lib.fluid_settings_setstr(settings, "audio.driver", drv);
	    res = lib.new_fluid_audio_driver(settings, synth);
	    if (res.address()) {
		return synth;
	    }
	} catch (e) {
	}
    }
    throw new Fluid4NodeError('Could create sytnth with ant driver from:' + drivers.join(', '))
}

function initSoundFonts(lib, synth, soundFonts) {

    var res = {};
    soundFonts.forEach(function (sfPath) {
	var sf2Id = lib.fluid_synth_sfload(synth, relPath(sfPath), 0);	
	
	if (res.hasOwnProperty(sfPath)) {
	    throw new Fluid4NodeError('Soundfont already loaded: ' + sfPath);
	}
	if (sf2Id === FLUID_FAILED) {
	    throw new Fluid4NodeError('Could load soundfont: ' + sfPath);
	}
	res[sfPath] = sf2Id;
    });
    return res;
}

var spec0 = {
    'drivers': ['dsound', 'winmidi', 'jack','alsa', 'pulseaudio', 'alsa_raw', 'alsa_seq'],
    'libs': [
	'libs/win/libfluidsynth.dll',
	'libs/linux/libfluidsynth.so.1'
    ],
    'soundFonts': ['./sf2/FluidR3_GM.sf2']
};

var  specByOSType= {
    'Linux': {
	'drivers': ['jack','alsa', 'pulseaudio', 'alsa_raw', 'alsa_seq'],
	'libs': [
	    'libs/linux/libfluidsynth.so.1'
	]
    },
    'Windows_NT': {
	'drivers': ['dsound', 'winmidi'],
    'libs': [
	'libs/win/libfluidsynth.dll'
    ],
    }
    
};

module.exports = function(spec) {

    var api = {
	FLUID_FAILED: FLUID_FAILED,
	getLib: function() {
	    return lib;
	}
    };
    
    if (spec) {
	spec.drivers = spec.drivers || specByOSType[osType].drivers || spec0.drivers;
	spec.libs = spec.libs || specByOSType[osType].libs || spec0.libs;
	spec.soundFonts = spec.soundFonts || specByOSType[osType].soundFonts || spec0.soundFonts;
	var lib = initLib(spec.libs);
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
	    for (var key in soundFonts) {
		lib.fluid_synth_sfunload(synth, soundFonts[key], 0);	
	    }
	    lib.delete_fluid_settings(settings);
	    lib.delete_fluid_synth(synth);
	};
    }
	
    return api;
};
