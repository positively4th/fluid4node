try {
    var f4n = require('./fluid4node.js')({});
} catch (e) {
    console.log(e.message);
    throw (e);
}
console.log('f4n', f4n);
    
var todos = [
    {chan: 0, program: 0, bank: 0, key: 60, gain: 1.0},
    {chan: 0, program: 0, bank: 0, key: 61, gain: 0.7},
    {chan: 0, program: 0, bank: 0, key: 62, gain: 0.4},
    {chan: 0, program: 0, bank: 0, key: 63, gain: 0.1},
    {chan: 1, program: 30, bank: 0, key: 63, gain: 0.1},
    {chan: 1, program: 30, bank: 0, key: 62, gain: 0.4},
    {chan: 1, program: 30, bank: 0, key: 61, gain: 0.7},
    {chan: 1, program: 30, bank: 0, key: 60, gain: 1.0},
];

function helper(index) {
    if (index - 1 >= 0) {
	f4n.noteOff(todos[index-1].chan, todos[index-1].key);
    }
    if (index >= todos.length) {
	f4n.destroy();
	console.log('done');
	return;
    }

    console.log(todos[index]);
    f4n.bankSelect(todos[index].chan, todos[index].bank);
    f4n.programChange(todos[index].chan, todos[index].program);
    f4n.setGain(todos[index].gain);
    f4n.noteOn(todos[index].chan, todos[index].key, 100);
    setTimeout(function() {
	helper(index + 1);
    }, 200);
}


helper(0);
