const assert = require('assert');
const { LEVEL } = require('../lib/level');
const testcase = require('./testcase');

describe('steps', () => {
  it('should work for this simple case', () => {
    const x = new LEVEL(testcase.step_down_simple_before);
    x.stepDown()
    const y = new LEVEL(testcase.step_down_simple_after);
    assert.ok(x.toString() === y.toString());
  });

  it('should work for a case where there is nothing to move', () => {
    const x = new LEVEL(testcase.step_down_cant_move);
    x.stepDown();
    const y = new LEVEL(testcase.step_down_cant_move);
    assert.ok(x.toString() === y.toString());
  });

  it('should work for a stack of items', () => {
    const x = new LEVEL(testcase.step_down_two_items_before);
    x.stepDown()
    const y = new LEVEL(testcase.step_down_two_items_after);
    assert.ok(x.toString() === y.toString());
  });

});
