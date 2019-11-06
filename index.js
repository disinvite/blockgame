const { LEVEL } = require('./lib/level');
const { solve } = require('./lib/solver');
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

const s = [
  ' . A^',
  '..AA ',
  '.C$. ',
  '.C.. ',
  'B    '
];

const xlevel = new LEVEL(s.join('\n'));
//console.log(solve(xlevel, 10));
console.log(`\nBEFORE:\n${xlevel}`);

// some nice ascii there.
console.log(xlevel.metasprites.map(x => x.map(y => y.padEnd(6, ' ')).join(' | ')).join('\n'));

//const x = new LEVEL(l1);
//console.log(x.tiles);

/*
const x = new LEVEL(testcase.two_shapes_before);
console.log(`\nBEFORE:\n${x}`);
x.stepDown();

console.log(`\nAFTER:\n${x}`);
*/