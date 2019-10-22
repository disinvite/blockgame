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

module.exports = {
 step_down_simple_before,
 step_down_simple_after,
 step_down_cant_move,
 step_down_two_items_before,
 step_down_two_items_after,
 shape_simple_before,
 shape_simple_after,
 two_shapes_before,
 two_shapes_after
};

