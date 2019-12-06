/*
Down: (column L-R, row B-T)
Up: (column L-R, row T-B)
Left: (row T-B, column L-R)
Right: (row T-B, column R-L)
*/

function getOrder(dim, direction) {
  const out = [];
  if(direction === 'up') {
    for (let col = 0; col < dim; col++) {
      const sub = [];
      for (let row = 0; row < dim; row++) {
        sub.push((row * dim) + col);
      }
      out.push(sub);
    }
  } else if (direction === 'down') {
    for (let col = 0; col < dim; col++) {
      const sub = [];
      for (let row = (dim - 1); row >= 0; row--) {
        sub.push((row * dim) + col);
      }
      out.push(sub);
    }
  } else if (direction === 'left') {
    for (let row = 0; row < dim; row++) {
      const sub = [];
      for (let col = 0; col < dim; col++) {
        sub.push((row * dim) + col);
      }
      out.push(sub);
    }
  } else if (direction === 'right') {
    for (let row = 0; row < dim; row++) {
      const sub = [];
      for (let col = (dim - 1); col >= 0; col--) {
        sub.push((row * dim) + col);
      }
      out.push(sub);
    }
  }
  return out;
}

// move all $ as far left as possible
function compress(line) {
  let emptyspaces = 0;
  let goal = false;
  for (let i = 0; i < line.length; i++) {
    const tile = line[i];
    if (tile === '.') {
      emptyspaces++;
    } else if (tile === '^') {
      emptyspaces++;
      goal = true;
    } else if (tile === '$') {
      if (goal) {
        line[i] = '.';
        emptyspaces++;
      } else {
        if (emptyspaces > 0) {
          line[i - emptyspaces] = '$';
          line[i] = '.';
        }
      }
    } else {
      goal = false;
      emptyspaces = 0;
    }
  }
  return line;
}

function scanForShapes(line) {
  let emptyspaces = 0;
  let lastShape = '';
  const out = [];
  for (let i = 0; i < line.length; i++) {
    const tile = line[i];
    if ((tile >= 'A') && (tile <= 'Z')) {
      if (lastShape === '') {
        lastShape = tile;
      }
      if (tile !== lastShape) {
        out.push([lastShape,emptyspaces]);
        //keep the same count if there's no space between consecutive shapes
        //ornot
        emptyspaces = 0;
        lastShape = tile;
      }
    } else {      
      if(lastShape !== '') {
        out.push([lastShape,emptyspaces]);
        emptyspaces = 0;
        lastShape = '';
      }

      if ((tile === '.') || (tile === '^')) {
        emptyspaces++;
      } else if (tile === ' ') {
        emptyspaces = 0;
      }
    }
  }

  // if a shape went all the way to the top of the board
  if (lastShape !== '') {
    out.push([lastShape,emptyspaces]);
  }
  return out;
}

function collateMovement(movements) {
  const least = {};
  for (const [shape, count] of movements.flat()) {
    if (!(shape in least)) {
      least[shape] = count;
    } else if (count < least[shape]) {
      least[shape] = count;
    }
  }

  return least;
}

function moveShapes(line, movements) {
  for (let i = 0; i < line.length; i++) {
    const tile = line[i];
    if (tile in movements) {
      const howMuch = movements[tile];
      if (howMuch > 0) {
        line[i - howMuch] = tile;
        line[i] = '.';
      }
    }
  }
  return line;
}

function backToLevelString(grid, invert, goal) {
  const tiles = grid.flat();
  const restored = invert.map(list => list.map(i => tiles[i]));
  if (restored[goal.row][goal.col] === '.') {
    restored[goal.row][goal.col] = '^';
  }
  return restored.map(list => list.join('')).join('\n');
}

class FastLevel {
  constructor(dim, goal) {
    this.dim = dim;
    this.goalIdx = (goal.row * dim) + goal.col;
    this.goal = { row: goal.row, col: goal.col };
    this.orderList = {
      up    : getOrder(dim, 'up'),
      down  : getOrder(dim, 'down'),
      left  : getOrder(dim, 'left'),
      right : getOrder(dim, 'right'),
    };

    const downInvert = JSON.parse(JSON.stringify(this.orderList.down));
    downInvert.reverse();
    downInvert.forEach(list => list.reverse());

    this.invertList = {
      up    : this.orderList.up,
      down  : downInvert,
      left  : this.orderList.left,
      right : this.orderList.right
    };
  }

  move(inputStr, direction) {
    // from level string
    const input = inputStr.split('\n').join('');
    let order = this.orderList[direction].map(list => list.map(i => input[i]));
    let invert = this.invertList[direction];

    /*
    order = order.map(compress);

    console.log( order );
    console.log( order.map(scanForShapes) );
    let y = collateMovement( order.map(scanForShapes) );
    order = order.map(t => moveShapes(t, y));
    console.log(order);
    order = order.map(compress);
    console.log(order);
    y = collateMovement( order.map(scanForShapes) );
    console.log(y);

    //console.log(order);
    */

    order = order.map(compress);
    while (true) {      
      let y = collateMovement( order.map(scanForShapes) );
      //console.log(order);
      //console.log(order.map(scanForShapes));

      const anyleft = Object.values(y).filter(x => x !== 0);
      if (anyleft.length === 0) {
        break;
      }
      order = order.map(t => moveShapes(t, y));
      order = order.map(compress);
    }
    
    // one for the road
    order = order.map(compress);

    return backToLevelString(order, invert, this.goal);
  }
}

exports.FastLevel = FastLevel;
