import os from "os";
import path from "path";
import ffi from "ffi-napi";
import { libSpec, void_ptr, char_ptr, FluidSynthLib } from "./api-wrapper";
import { debug as d } from "debug";

const debug = d("fluid4node");

const osType = os.type() as "Windows_NT" | "Darwin" | "Linux";

const FLUID_FAILED = -1;

const specByOSType = {
  Linux: {
    drivers: ["jack", "alsa", "pulseaudio", "alsa_raw", "alsa_seq"],
    libs: ["../libs/linux/libfluidsynth.so.1"],
  },
  Darwin: {
    drivers: ["coreaudio"],
    libs: ["../libs/darwin/libfluidsynth.2.3.5.dylib"],
  },
  Windows_NT: {
    drivers: ["dsound", "winmidi"],
    libs: [
      "../libs/win/libfluidsynth64.dll",
      "../libs/win/libfluidsynth32.dll",
      "libfluidsynth.dll",
    ],
  },
};

interface Spec {
  drivers: string[];
  libs: string[];
  soundFonts: string[];
  /**
   * 8000 - 96000 (kHz)
   */
  sampleRate: number;
}

var spec0 = {
  drivers: [
    ...specByOSType.Windows_NT.drivers,
    ...specByOSType.Linux.drivers,
    ...specByOSType.Darwin.drivers,
  ],
  libs: [
    ...specByOSType.Windows_NT.libs,
    ...specByOSType.Linux.libs,
    ...specByOSType.Darwin.libs,
  ],
  soundFonts: ["../sf2/FluidR3_GM.sf2"],
};

export = (spec: Partial<Spec> = {}) => {
  const moduleDir = __dirname;
  spec.drivers = spec.drivers || specByOSType[osType].drivers || spec0.drivers;
  spec.libs = spec.libs || specByOSType[osType].libs || spec0.libs;
  spec.soundFonts = spec.soundFonts || spec0.soundFonts;
  spec.sampleRate = spec.sampleRate || 44100;

  class Fluid4NodeError {
    name: string;
    message: any;
    spec: any;
    stack: string | undefined;
    constructor(message: string, detail?: any) {
      this.name = "Fluid4NodeError";
      this.message = message;
      this.spec = detail || {};
      this.stack = new Error().stack;
    }
  }

  function processPath(_path: string) {
    const normalizedPath = path.normalize(
      _path.startsWith("../") || _path.startsWith("./")
        ? path.join(moduleDir, _path)
        : _path
    );
    return path.resolve(normalizedPath);
  }

  function initLib(libs: string[]): FluidSynthLib {
    const failedLibs = {} as { [libPath: string]: string };
    var i = 0;
    var lib;
    while (i < libs.length && !lib) {
      const path = processPath(libs[i++]);
      debug(`Using driver found at ${path}`);
      try {
        lib = ffi.Library(path, libSpec);
      } catch (e) {
        failedLibs[path] = e.message;
      }
    }
    if (!lib) {
      throw new Fluid4NodeError(
        "Could not wrap any native library from list: " + libs.join(", "),
        failedLibs
      );
    }
    return lib;
  }

  function initSynth(lib: any, synth: any, settings: any, drivers: string[]) {
    var driverMask = {} as { [driverOption: string]: boolean };
    lib.fluid_settings_foreach_option(
      settings,
      "audio.driver",
      null,
      ffi.Callback(
        "void",
        [void_ptr, char_ptr, char_ptr],
        (_data: any, _name: any, option: string) => (driverMask[option] = true)
      )
    );

    const failedDrivers = {} as { [driverName: string]: "Masked" };

    var i = 0;
    while (i < drivers.length) {
      const drv = drivers[i++];
      if (!driverMask[drv]) {
        failedDrivers[drv] = "Masked";
        continue;
      }
      try {
        lib.fluid_settings_setstr(settings, "audio.driver", drv);
        const driver = lib.new_fluid_audio_driver(settings, synth);
        if (driver.address()) {
          return driver;
        }
        failedDrivers[drv] = driver;
      } catch (e) {
        failedDrivers[drv] = e;
      }
    }
    throw new Fluid4NodeError(
      "Could not create sytnth with and driver from: " + drivers.join(", "),
      failedDrivers
    );
  }

  function initSoundFonts(lib: any, synth: any, soundFonts: string[]) {
    var res = {} as { [path: string]: number };
    soundFonts.forEach(function (sfPath0) {
      var sfPath = processPath(sfPath0);
      var sf2Id = lib.fluid_synth_sfload(synth, sfPath, 0);

      if (res.hasOwnProperty(sfPath)) {
        throw new Fluid4NodeError("Soundfont already loaded: " + sfPath);
      }
      if (sf2Id === FLUID_FAILED) {
        throw new Fluid4NodeError("Could load soundfont: " + sfPath);
      }
      res[sfPath] = sf2Id;
    });
    return res;
  }

  const lib = initLib(spec.libs);
  const settings = lib.new_fluid_settings();
  debug(`spec.sampleRate: ${spec.sampleRate}`);

  // This cannot be changed at runtime, so set it before creating the synth
  lib.fluid_settings_setnum(settings, "synth.sample-rate", spec.sampleRate);
  const synth = lib.new_fluid_synth(settings);
  const driver = initSynth(lib, synth, settings, spec.drivers!);

  if (spec.soundFonts.length > 0) {
    var soundFonts = initSoundFonts(lib, synth, spec.soundFonts);
  }

  const api = {
    FLUID_FAILED: FLUID_FAILED,
    getLib: function () {
      return lib;
    },
    getFailedLibs: () => [],
    setGain: (gain: number): void => lib.fluid_synth_set_gain(synth, gain),
    /**
     *
     * @param voices - number of voices: 1-256
     */
    setPolyphony: (voices: number) =>
      lib.fluid_synth_set_polyphony(synth, voices),
    getSynth: () => synth,
    programChange: (chan: number, program: number): number =>
      lib.fluid_synth_program_change(synth, chan, program),
    bankSelect: (chan: number, bank: number): number =>
      lib.fluid_synth_program_change(synth, chan, bank),
    noteOn: (chan: number, key: number, vel: number): number =>
      lib.fluid_synth_noteon(synth, chan, key, vel),
    noteOff: (chan: number, key: number): number =>
      lib.fluid_synth_noteoff(synth, chan, key),
    destroy: () => {
      for (var key in soundFonts) {
        lib.fluid_synth_sfunload(synth, soundFonts[key], 0);
      }
      lib.delete_fluid_synth(synth);
      lib.delete_fluid_audio_driver(driver);
      lib.delete_fluid_settings(settings);
    },
  };

  return api;
};
