import { FluidSynthLib } from "./api-wrapper";
interface Spec {
    drivers: string[];
    libs: string[];
    soundFonts: string[];
    /**
     * 8000 - 96000 (kHz)
     */
    sampleRate: number;
}
declare const _default: (spec?: Partial<Spec>) => {
    FLUID_FAILED: number;
    getLib: () => FluidSynthLib;
    getFailedLibs: () => never[];
    setGain: (gain: number) => void;
    /**
     *
     * @param voices - number of voices: 1-256
     */
    setPolyphony: (voices: number) => import("./api-wrapper").FLUID_OUTCOME;
    getSynth: () => any;
    programChange: (chan: number, program: number) => import("./api-wrapper").FLUID_OUTCOME;
    bankSelect: (chan: number, bank: number) => import("./api-wrapper").FLUID_OUTCOME;
    noteOn: (chan: number, key: number, vel: number) => import("./api-wrapper").FLUID_OUTCOME;
    noteOff: (chan: number, key: number) => import("./api-wrapper").FLUID_OUTCOME;
    destroy: () => void;
};
export = _default;
