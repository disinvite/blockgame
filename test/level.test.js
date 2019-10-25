const assert = require('assert');
const { LEVEL } = require('../lib/level');
const testcase = require('./testcase');

describe('buildShapeList', () => {
  it('should work', () => {
    const x = new LEVEL(testcase.shape_simple_before);
    assert.deepEqual(x.buildShapeList(), ['A']);
  });
});

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

  it('should work for a shape', () => {
    const x = new LEVEL(testcase.shape_simple_before);
    x.stepDown()
    const y = new LEVEL(testcase.shape_simple_after);
    assert.ok(x.toString() === y.toString());
  });

  it('should work for two shapes', () => {
    const x = new LEVEL(testcase.two_shapes_before);
    x.stepDown()
    const y = new LEVEL(testcase.two_shapes_after);
    assert.ok(x.toString() === y.toString());
  });

  it('should work for stacked shapes', () => {
    const x = new LEVEL(testcase.stacked_shapes_cant_move);
    x.stepDown()
    const y = new LEVEL(testcase.stacked_shapes_cant_move);
    assert.ok(x.toString() === y.toString());
  });

  it('should work for stacked shapes at the bottom of the board', () => {
    const x = new LEVEL(testcase.stacked_shapes_cant_move_bottom);
    x.stepDown()
    const y = new LEVEL(testcase.stacked_shapes_cant_move_bottom);
    assert.ok(x.toString() === y.toString());
  });

  it('should work for connected stacked shapes', () => {
    const x = new LEVEL(testcase.stacked_shapes_cant_move_hook);
    x.stepDown()
    const y = new LEVEL(testcase.stacked_shapes_cant_move_hook);
    assert.ok(x.toString() === y.toString());
  });

  it('should work for the tetris shape', () => {
    const x = new LEVEL(testcase.shape_tetris_cant_move);
    x.stepDown()
    const y = new LEVEL(testcase.shape_tetris_cant_move);
    assert.ok(x.toString() === y.toString());
  });

  it('should work for this worst case I came up with', () => {
    const x = new LEVEL(testcase.stacked_shapes_try_to_break_it);
    x.stepDown()
    const y = new LEVEL(testcase.stacked_shapes_try_to_break_it);
    assert.ok(x.toString() === y.toString());
  });

});

describe('rotate', () => {
  it('should work for clockwise rotation', () => {
    const stages = [
      testcase.rotate_position_one,
      testcase.rotate_position_two,
      testcase.rotate_position_three,
      testcase.rotate_position_four,
    ].map(x => new LEVEL(x));
    const x = new LEVEL(testcase.rotate_position_one);
    x.rotateClockwise();
    console.log(x.toString());
    console.log(stages[1].toString());
    assert.ok(x.toString() === stages[1].toString());
    x.rotateClockwise();
    assert.ok(x.toString() === stages[2].toString());
    x.rotateClockwise();
    assert.ok(x.toString() === stages[3].toString());
    x.rotateClockwise();
    assert.ok(x.toString() === stages[0].toString());
  });

  it('should work for counter-clockwise rotation', () => {
    const stages = [
      testcase.rotate_position_one,
      testcase.rotate_position_two,
      testcase.rotate_position_three,
      testcase.rotate_position_four,
    ].map(x => new LEVEL(x));
    const x = new LEVEL(testcase.rotate_position_one);
    x.rotateCounterClockwise();
    assert.ok(x.toString() === stages[3].toString());
    x.rotateCounterClockwise();
    assert.ok(x.toString() === stages[2].toString());
    x.rotateCounterClockwise();
    assert.ok(x.toString() === stages[1].toString());
    x.rotateCounterClockwise();
    assert.ok(x.toString() === stages[0].toString());
  });
});
