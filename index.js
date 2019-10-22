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

const x = new LEVEL(testcase.two_shapes_before);
console.log(`\nBEFORE:\n${x}`);
x.stepDown();

console.log(`\nAFTER:\n${x}`);