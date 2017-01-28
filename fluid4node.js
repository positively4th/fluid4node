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

var  specByOSType= {
    'Linux': {
	'drivers': ['jack','alsa', 'pulseaudio', 'alsa_raw', 'alsa_seq'],
	'libs': [
	    './libs/linux/libfluidsynth.so.1'
	]
    },
    'Windows_NT': {
	'drivers': ['dsound', 'winmidi'],
	'libs': [
	    './libs/win/libfluidsynth64.dll',
	    './libs/win/libfluidsynth32.dll',
	    'libfluidsynth.dll'
	],
    }
    
};

var spec0 = {
    'drivers': [].concat(specByOSType.Windows_NT.drivers, specByOSType.Linux.drivers),
    'libs': [].concat(specByOSType.Windows_NT.libs, specByOSType.Linux.libs),
    'soundFonts': ['./sf2/FluidR3_GM.sf2']
};
//console.log(spec0);

module.exports = function(spec) {

    var moduleDir = __dirname;

    function Fluid4NodeError(message, spec) {
	this.name = 'Fluid4NodeError';
	this.message = message;
	this.spec = spec || {};
	this.stack = (new Error()).stack;
    }

    function processPath(_path) {
	var res = path.normalize(_path.length > 1 && _path[0] === '.' && _path[1] === '/' ? moduleDir + '/' + _path : _path);
	
	return path.resolve(res);
    }

    var libSpec = {
	'new_fluid_settings': [ fluid_settings_t, [] ],
	'delete_fluid_settings': ['void', [fluid_settings_t]],
	'fluid_settings_setstr': ['int', [fluid_settings_t, char_ptr, char_ptr]],
	'new_fluid_synth': [fluid_synth_t, [fluid_settings_t]],
	'delete_fluid_synth': ['int', [fluid_synth_t]],
	'new_fluid_audio_driver': [fluid_audio_driver_t, [fluid_settings_t, fluid_synth_t]],
	'delete_fluid_audio_driver': ['void', [fluid_audio_driver_t]], 	
	'fluid_synth_sfload': ['int', [fluid_synth_t, char_ptr, 'int']],
	'fluid_synth_sfunload': ['int', [fluid_synth_t, 'int', 'int']],
	'fluid_synth_noteon': ['int', [fluid_synth_t, 'int', 'int', 'int']],
	'fluid_synth_noteoff': ['int', [fluid_synth_t, 'int', 'int']],
	'fluid_synth_bank_select': ['int', [fluid_synth_t, 'int', 'uint']],	 
	'fluid_synth_program_change': ['int', [fluid_synth_t, 'int', 'int']],
	'fluid_synth_set_gain': [ 'void', [ fluid_synth_t, 'float'] ],
	'fluid_settings_foreach_option': ['void', [fluid_settings_t, char_ptr, void_ptr, fluid_settings_foreach_option_t]]
    };

    function initLib(libs) {
	var res = {
	    lib: false,
	    failedLibs: {}
	};
	var i = 0;
	while (i < libs.length && !res.lib) {
	    try {
		var path = processPath(libs[i++]);
		res.lib = ffi.Library(path, libSpec);
	    } catch (e) {
		res.failedLibs[path] = e.message;
		res.lib = false;
	    }
	}
	if (!res.lib) {
	    throw new Fluid4NodeError('Could not wrap any native library from list: ' + libs.join(', '), res.failedLibs);
	}
	return res;
    }

    function initSynth(lib, synth, settings, drivers) {

	var driverMask = {};
	lib.fluid_settings_foreach_option(settings, "audio.driver", null,
					  ffi.Callback('void', [void_ptr, char_ptr, char_ptr],
						       function (data, name, option) {
							   driverMask[option] = true;
						       })
					 );
	
	var res = {
	    driver: false,
	    failedDrivers: {}
	};
	var i = 0;
	var drv;
	while (i < drivers.length) {
	    drv = drivers[i++];
	    if (!driverMask[drv]) {
		res.failedDrivers[drv] = 'Masked';
		continue;
	    }
	    try {
		lib.fluid_settings_setstr(settings, "audio.driver", drv);
		res.driver = lib.new_fluid_audio_driver(settings, synth);
		if (res.driver.address()) {
		    return res;
		}
		res.failedDrivers[drv] = res.lib.driver;
	    } catch (e) {
		res.failedDrivers[drv] = e;
		
 	    }
	}
	throw new Fluid4NodeError('Could not create sytnth with and driver from: ' + drivers.join(', '), res.failedDrivers);
    }

    function initSoundFonts(lib, synth, soundFonts) {

	var res = {};
	soundFonts.forEach(function (sfPath0) {
	    var sfPath = processPath(sfPath0);
	    var sf2Id = lib.fluid_synth_sfload(synth, sfPath, 0);	
	    
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
//	console.log('lib:', lib);
	var failedLib = lib.failedLibs;
	lib = lib.lib;

	var settings = lib.new_fluid_settings();
//	console.log('settings', settings);

	var synth = lib.new_fluid_synth(settings);

	var driver = initSynth(lib, synth, settings, spec.drivers);
//	console.log('driver:', driver);
	var failedDrivers = driver.failedDrivers;
	driver = driver.driver;
	
	if (spec.soundFonts.length > 0) {
	    var soundFonts = initSoundFonts(lib, synth, spec.soundFonts);
	}
	api.getFailedLibs = function () {
	    return lib.fluid_synth_set_gain(synth, gain);
	};
	api.setGain = function (gain) {
	    return lib.fluid_synth_set_gain(synth, gain);
	};
	api.programChange = function (chan, program) {
	    return lib.fluid_synth_program_change(synth, chan, program);
	};
	api.bankSelect = function (chan, bank) {
	    return lib.fluid_synth_program_change(synth, chan, bank);
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
	    lib.delete_fluid_synth(synth);
	    lib.delete_fluid_audio_driver(driver);
	    lib.delete_fluid_settings(settings);
	};
    }
    
    return api;
};
