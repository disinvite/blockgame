const step_down_simple_before = `
$.
..
`;

const step_down_simple_after = `
..
$.
`;

const step_down_cant_move = `
$.
 .
`;

const step_down_two_items_before = `
$..
$..
...
`;

const step_down_two_items_after = `
...
$..
$..
`;

const shape_simple_before = `
AA$
 ..
...
`;

const shape_simple_after = `
AA.
 .$
...
`;

const two_shapes_before = `
AABB
 ...
....
....
`;

const two_shapes_after = `
AA..
 .BB
....
....
`;

const two_shapes_after_slide = `
AA..
 ...
....
..BB
`;

const stacked_shapes_cant_move = `
....
.BBB
AA..
. ..
`;

const stacked_shapes_cant_move_bottom = `
...
.BB
AA.
`;

const stacked_shapes_cant_move_hook = `
CCC..
AAC..
ABC..
. C..
.....
`;

const stacked_shapes_try_to_break_it = `
AABB
ABB 
A...
....
`;

const shape_tetris_cant_move = `
.AA
AA 
...
`;

const rotate_position_one = `
ABC
DEF
GHI
`;

const rotate_position_two = `
GDA
HEB
IFC
`;

const rotate_position_three = `
IHG
FED
CBA
`;

const rotate_position_four = `
CFI
BEH
ADG
`;

const goal_test_before = `
$.
^.
`;

const goal_test_after = `
..
^.
`;

const goal_blocks_cant_before = `
A.
^.
`;

const goal_blocks_cant_after = `
..
A.
`;

module.exports = {
 step_down_simple_before,
 step_down_simple_after,
 step_down_cant_move,
 step_down_two_items_before,
 step_down_two_items_after,
 shape_simple_before,
 shape_simple_after,
 two_shapes_before,
 two_shapes_after,
 two_shapes_after_slide,
 stacked_shapes_cant_move,
 stacked_shapes_cant_move_bottom,
 stacked_shapes_cant_move_hook,
 stacked_shapes_try_to_break_it,
 shape_tetris_cant_move,
 rotate_position_one,
 rotate_position_two,
 rotate_position_three,
 rotate_position_four,
 goal_test_before,
 goal_test_after,
 goal_blocks_cant_before,
 goal_blocks_cant_after
};

