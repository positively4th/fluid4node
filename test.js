try {
    var f4n = require('./dist/fluid4node.js')({});
} catch (e) {
    console.log(e.message);
    throw (e);
}

// Set the number of voices to 64
f4n.setPolyphony(64);

var todos = [
    { chan: 0, program: 0, bank: 0, key: 60, gain: 1.0 },
    { chan: 0, program: 0, bank: 0, key: 61, gain: 0.7 },
    { chan: 0, program: 0, bank: 0, key: 62, gain: 0.4 },
    { chan: 0, program: 0, bank: 0, key: 63, gain: 0.1 },
    { chan: 1, program: 30, bank: 0, key: 63, gain: 0.1 },
    { chan: 1, program: 30, bank: 0, key: 62, gain: 0.4 },
    { chan: 1, program: 30, bank: 0, key: 61, gain: 0.7 },
    { chan: 1, program: 30, bank: 0, key: 60, gain: 1.0 },
];

function helper(index) {
    if (index - 1 >= 0) {
        f4n.noteOff(todos[index - 1].chan, todos[index - 1].key);
    }
    if (index >= todos.length) {
        f4n.destroy();
        console.log('done');
        return;
    }

    console.log(todos[index]);
    'bankSelect', f4n.bankSelect(todos[index].chan, todos[index].bank);
    'programChange', f4n.programChange(todos[index].chan, todos[index].program);
    'setGain', f4n.setGain(todos[index].gain);
    'noteOn', f4n.noteOn(todos[index].chan, todos[index].key, 100);
    setTimeout(function () {
        helper(index + 1);
    }, 200);
}

helper(0);
