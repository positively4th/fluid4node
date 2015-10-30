var Fluid = require ('./build/Release/fluid4node');
console.log(Fluid);

fluid = new Fluid();
fluid.settings_setstr("audio.driver", "alsa");
fluid.synth_sfload("/usr/share/sounds/sf2/FluidR3_GM.sf2", 1);	
fluid.new_audio_driver();
fluid.synth_noteon(0, 60, 100);
setTimeout(function() {
    fluid.synth_noteoff(0, 60);
    fluid.synth_program_change(0, 10);
    fluid.synth_noteon(0, 60, 100);
    setTimeout(function() {
	fluid.synth_noteoff(0, 60);
    }, 1000);
}, 1000);
