const assert = require('assert');
const { LEVEL } = require('../lib/level');

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

const no_movement = `
$.
 .
`;

describe('steps', () => {
  it('should work for this simple case', () => {
    const x = new LEVEL(l1);
    x.stepDown()
    const y = new LEVEL(l2);
    assert.ok(x.toString() === y.toString());
  });

  it('should work for a case where there is nothing to move', () => {
    const x = new LEVEL(no_movement);
    x.stepDown();
    const y = new LEVEL(no_movement);
    assert.ok(x.toString() === y.toString());
  });
});
