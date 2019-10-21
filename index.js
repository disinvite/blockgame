const { LEVEL } = require('./lib/level');

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

const x = new LEVEL(l1);
console.log(x.tiles);
