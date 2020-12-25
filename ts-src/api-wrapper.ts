import ffi from "ffi-napi";
import ref from "ref-napi";

export const char_ptr = ffi.types.CString;
export const void_ptr = ref.refType(ffi.types.void);
const fluid_settings_t = ref.refType(ffi.types.void);
const fluid_synth_t = ref.refType(ffi.types.void);
const fluid_audio_driver_t = ref.refType(ffi.types.void);
const fluid_settings_foreach_option_t = ref.refType(ffi.types.void);

export const libSpec = {
  new_fluid_settings: [fluid_settings_t, []],
  delete_fluid_settings: ["void", [fluid_settings_t]],
  fluid_settings_setstr: ["int", [fluid_settings_t, char_ptr, char_ptr]],
  fluid_settings_setnum: ["int", [fluid_settings_t, char_ptr, "double"]],
  new_fluid_synth: [fluid_synth_t, [fluid_settings_t]],
  delete_fluid_synth: ["int", [fluid_synth_t]],
  new_fluid_audio_driver: [
    fluid_audio_driver_t,
    [fluid_settings_t, fluid_synth_t],
  ],
  delete_fluid_audio_driver: ["void", [fluid_audio_driver_t]],
  fluid_synth_sfload: ["int", [fluid_synth_t, char_ptr, "int"]],
  fluid_synth_sfunload: ["int", [fluid_synth_t, "int", "int"]],
  fluid_synth_noteon: ["int", [fluid_synth_t, "int", "int", "int"]],
  fluid_synth_noteoff: ["int", [fluid_synth_t, "int", "int"]],
  fluid_synth_bank_select: ["int", [fluid_synth_t, "int", "uint"]],
  fluid_synth_program_change: ["int", [fluid_synth_t, "int", "int"]],
  fluid_synth_set_gain: ["void", [fluid_synth_t, "float"]],
  fluid_synth_set_polyphony: ["int", [fluid_synth_t, "int"]],
  fluid_settings_foreach_option: [
    "void",
    [fluid_settings_t, char_ptr, void_ptr, fluid_settings_foreach_option_t],
  ],
};

const FLUID_FAILED = -1;
const FLUID_OK = 0;
export type FLUID_OUTCOME = typeof FLUID_FAILED | typeof FLUID_OK;

export interface FluidSynthLib {
  new_fluid_settings: () => any;
  delete_fluid_settings: (settings: any) => Promise<any>;
  fluid_settings_setstr: (
    settings: any,
    name: string,
    value: string
  ) => FLUID_OUTCOME;
  fluid_settings_setnum: (
    settings: any,
    name: string,
    value: number
  ) => FLUID_OUTCOME;
  new_fluid_synth: (settings: any) => any;
  delete_fluid_synth: (synth: any) => any;
  new_fluid_audio_driver: () => any;
  delete_fluid_audio_driver: (driver: any) => any;
  fluid_synth_sfload: (synth: any, sfPath: string, key: 0) => any;
  fluid_synth_sfunload: (synth: any, soundFont: number, key: 0) => any;
  fluid_synth_noteon: (
    synth: any,
    chan: number,
    key: number,
    vel: number
  ) => any;
  fluid_synth_noteoff: (synth: any, chan: number, key: number) => FLUID_OUTCOME;
  fluid_synth_bank_select: (
    synth: any,
    chan: number,
    bank: number
  ) => FLUID_OUTCOME;
  fluid_synth_program_change: (
    synth: any,
    chan: number,
    program: number
  ) => any;
  fluid_synth_set_gain: (synth: any, gain: number) => void;
  fluid_synth_set_polyphony: (synth: any, voices: number) => FLUID_OUTCOME;
  fluid_settings_foreach_option: () => any;
}
