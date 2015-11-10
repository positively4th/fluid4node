var Fluid = require ('./build/Release/fluid4node');

var todos = [
    {chan: 0, program: 0, key: 60, gain: 1.0},
    {chan: 0, program: 0, key: 61, gain: 0.7},
    {chan: 0, program: 0, key: 62, gain: 0.4},
    {chan: 0, program: 0, key: 63, gain: 0.1},
    {chan: 1, program: 30, key: 63, gain: 0.1},
    {chan: 1, program: 30, key: 62, gain: 0.4},
    {chan: 1, program: 30, key: 61, gain: 0.7},
    {chan: 1, program: 30, key: 60, gain: 1.0},
];

function helper(index) {
    if (index - 1 >= 0) {
	fluid.synth_noteoff(todos[index-1].chan, todos[index-1].key);
    }
    if (index >= todos.length) {
	return;
    }

    fluid.synth_program_change(todos[index].chan, todos[index].program);
    fluid.synth_set_gain(todos[index].gain);
    fluid.synth_noteon(todos[index].chan, todos[index].key, 100);
    setTimeout(function() {
	helper(index + 1);
    }, 200);
}

fluid = new Fluid();
fluid.settings_setstr("audio.driver", "alsa");
fluid.synth_sfload("/usr/share/sounds/sf2/FluidR3_GM.sf2", 1);	
fluid.new_audio_driver();
helper(0);
