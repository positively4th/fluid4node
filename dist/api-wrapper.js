"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.libSpec = exports.void_ptr = exports.char_ptr = void 0;
const ffi_napi_1 = __importDefault(require("ffi-napi"));
const ref_napi_1 = __importDefault(require("ref-napi"));
exports.char_ptr = ffi_napi_1.default.types.CString;
exports.void_ptr = ref_napi_1.default.refType(ffi_napi_1.default.types.void);
const fluid_settings_t = ref_napi_1.default.refType(ffi_napi_1.default.types.void);
const fluid_synth_t = ref_napi_1.default.refType(ffi_napi_1.default.types.void);
const fluid_audio_driver_t = ref_napi_1.default.refType(ffi_napi_1.default.types.void);
const fluid_settings_foreach_option_t = ref_napi_1.default.refType(ffi_napi_1.default.types.void);
exports.libSpec = {
    new_fluid_settings: [fluid_settings_t, []],
    delete_fluid_settings: ["void", [fluid_settings_t]],
    fluid_settings_setstr: ["int", [fluid_settings_t, exports.char_ptr, exports.char_ptr]],
    fluid_settings_setnum: ["int", [fluid_settings_t, exports.char_ptr, "double"]],
    new_fluid_synth: [fluid_synth_t, [fluid_settings_t]],
    delete_fluid_synth: ["int", [fluid_synth_t]],
    new_fluid_audio_driver: [
        fluid_audio_driver_t,
        [fluid_settings_t, fluid_synth_t],
    ],
    delete_fluid_audio_driver: ["void", [fluid_audio_driver_t]],
    fluid_synth_sfload: ["int", [fluid_synth_t, exports.char_ptr, "int"]],
    fluid_synth_sfunload: ["int", [fluid_synth_t, "int", "int"]],
    fluid_synth_noteon: ["int", [fluid_synth_t, "int", "int", "int"]],
    fluid_synth_noteoff: ["int", [fluid_synth_t, "int", "int"]],
    fluid_synth_bank_select: ["int", [fluid_synth_t, "int", "uint"]],
    fluid_synth_program_change: ["int", [fluid_synth_t, "int", "int"]],
    fluid_synth_set_gain: ["void", [fluid_synth_t, "float"]],
    fluid_synth_set_polyphony: ["int", [fluid_synth_t, "int"]],
    fluid_settings_foreach_option: [
        "void",
        [fluid_settings_t, exports.char_ptr, exports.void_ptr, fluid_settings_foreach_option_t],
    ],
};
const FLUID_FAILED = -1;
const FLUID_OK = 0;
