const { LEVEL } = require('./lib/level');
const testcase = require('./test/testcase');

const l1 = `
$ .. 
....=
.... 
 ..  
     
`;

// after step down

const l2 = `
. .. 
$...=
.... 
 ..  
     
`;

//const x = new LEVEL(l1);
//console.log(x.tiles);

const x = new LEVEL(testcase.stacked_shapes_try_to_break_it);
console.log(`\nBEFORE:\n${x}`);
x.stepDown();

console.log(`\nAFTER:\n${x}`);