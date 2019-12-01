/*
Should we require that levels are square? For simplicity, so we only need to
store one variable for the "size" of the map? Should the editor automatically
pad levels with blank space to accomplish this?

How should levels be stored? On the real system we won't have array access so
is it worth getting used to stepping through it as a flat string?
*/

const itemIsShape = item => (item >= 'A') && (item <= 'F');
const TILE_EMPTY     = '.';
const TILE_DIAMOND   = '$';
const TILE_BLOCK     = ' ';
const TILE_GOAL      = '^';

// maybe just say which sides get the border
// otherwise this is gonna be way too complex
const metaAddonArray = {
   0: '~UDLR',
   1: '~UDL',
   2: '~UDR',
   3: '~UD',
   4: '~ULR',
   5: '~UL',
   6: '~UR',
   7: '~U',
   8: '~DLR',
   9: '~DL',
  10: '~DR',
  11: '~D',
  12: '~LR',
  13: '~L',
  14: '~R',
  15: '~'
};

function buildMeta(tilein) {
  const metaTiles = JSON.parse(JSON.stringify(tilein))  // deep copy hack
  const dim = metaTiles.length;
  for (let row = 0; row < dim; row++) {
    for (let col = 0; col < dim; col++) {
      // extract the first char from all of these.
      // we'll just jam the metadata on the end at this stage.
      // in the real game this will be Just The Bare Essentials
      const curTile = metaTiles[row][col][0];
      const tileUp = (row === 0) ? ' ' : metaTiles[row - 1][col][0];
      const tileDown = (row === (dim - 1)) ? ' ' : metaTiles[row + 1][col][0];
      const tileLeft = (col === 0) ? ' ' : metaTiles[row][col - 1][0];
      const tileRight = (col === (dim - 1)) ? ' ' : metaTiles[row][col + 1][0];

      if (itemIsShape(curTile)) {
        const checks = [tileUp, tileDown, tileLeft, tileRight].map(x => x === curTile ? 1 : 0);
        const which = (checks[0] << 3) + (checks[1] << 2) + (checks[2] << 1) + checks[3];
        metaTiles[row][col] += metaAddonArray[which];
      }
    }
  }
  return metaTiles;
}

class LEVEL {
  constructor(str) {
    // mutating the string we gave it into a 2-dimensional array
    this.tiles = str
      .split('\n')
      .filter(x => x.length > 0)
      .map(x => x.split(''));

    // to save on lookups later
    this.dim = this.tiles.length;

    // all this stuff is gonna be blocks in memory that get copied around.
    // pre-processed from the level editor.
    this.shapeCanMove = {'A': true, 'B': true, 'C': true, 'D': true, 'E': true, 'F': true};

    // remember where the goal is so blocks can cover it but not get removed
    this.goal = {row: -1, col: -1}; // for test cases that lack goals

    for(let row = 0; row < this.dim; row++) {
      for(let col = 0; col < this.dim; col++) {
        if (this.tiles[row][col] === TILE_GOAL) {
          this.goal = {row, col};
        }
      }
    }

    // probably need a validation step here. must have exactly one goal, etc.
  }

  get metasprites() {
    return buildMeta(this.tiles);
  }

  get diamonds() {
    let count = 0;
    const levelArr = this.tiles.flat();
    for(let i = 0; i < levelArr.length; i++) {
      if (levelArr[i] === TILE_DIAMOND) {
        count++;
      }
    }
    return count;
  }

  isDone() {
    return this.diamonds === 0;
  }

  rotateCounterClockwise() {
    // lol
    this.rotateClockwise();
    this.rotateClockwise();
    this.rotateClockwise();
  }

  rotateClockwise() {
    // yikes fam
    const dimOverTwo = Math.ceil(this.dim / 2);
    for(let row = 0; row < dimOverTwo; row++) {
      for(let col = row; col < (this.dim - row - 1); col++) {
        const temp = this.tiles[row][col]; 
        this.tiles[row][col] = this.tiles[this.dim - 1 - col][row]; 
        this.tiles[this.dim - 1 - col][row] = this.tiles[this.dim - 1 - row][this.dim - 1 - col]; 
        this.tiles[this.dim - 1 - row][this.dim - 1 - col] = this.tiles[col][this.dim - 1 - row];
        this.tiles[col][this.dim - 1 - row] = temp; 
      }
    }

    // this whole thing is gonna get removed anyway
    if (this.goal.row !== -1) {
      let gc = (this.dim - this.goal.row - 1);
      let gr = this.goal.col;
      this.goal.row = gr;
      this.goal.col = gc;
    }
  }

  /*
  so what is this actually going to look like on the real hardware?
  bitstring of tiles that will move?
  just keep doing the "first" pass until it is stable?

  I wonder if it's less complex to just have every level as its own 12x12
  square (or whatever size) in memory
  */

  stepLeft() {
    this.rotateClockwise();
    this.rotateClockwise();
    this.rotateClockwise();
    let result = this.stepDown();
    this.rotateClockwise();
    return result;
  }

  stepRight() {
    this.rotateClockwise();
    let result = this.stepDown();
    this.rotateClockwise();
    this.rotateClockwise();
    this.rotateClockwise();
    return result;
  }

  stepUp() {
    this.rotateClockwise();
    this.rotateClockwise();
    let result = this.stepDown();
    this.rotateClockwise();
    this.rotateClockwise();
    return result;
  }

  slideLeft() {
    this.rotateClockwise();
    this.rotateClockwise();
    this.rotateClockwise();
    this.slideDown();
    this.rotateClockwise();
  }

  slideRight() {
    this.rotateClockwise();
    this.slideDown();
    this.rotateClockwise();
    this.rotateClockwise();
    this.rotateClockwise();
  }

  slideUp() {
    this.rotateClockwise();
    this.rotateClockwise();
    this.slideDown();
    this.rotateClockwise();
    this.rotateClockwise();
  }

  slideDown() {
    while(1) {
      if (!this.stepDown()) {
        break;
      }
    }
  }

  stepDown() {
    let didMove = false;

    // reset these as they are now stored as part of the object
    Object.keys(this.shapeCanMove).forEach(k => this.shapeCanMove[k] = true);

    // you need as many passes as there are shapes (that can move)
    for (let pass = 0; pass < 3; pass++) {
      // column order doesn't matter
      for (let col = 0; col < this.dim; col++) {
        // starting at bottom row and going up
        let emptySpace = false;
        for (let row = this.dim - 1; row >= 0; row--) {
          const curTile = this.tiles[row][col];

          if ((curTile === TILE_EMPTY) || (curTile === TILE_GOAL)) {
            emptySpace = true;
            continue;
          }

          if (curTile === TILE_BLOCK) {
            emptySpace = false;
            continue;
          }

          if (itemIsShape(curTile)) {
            this.shapeCanMove[curTile] &= emptySpace;
            if (!this.shapeCanMove[curTile]) {
              emptySpace = false;
              continue;
            }
          }
        }
      }
    }


    // column order doesn't matter
    for (let col = 0; col < this.dim; col++) {
      // starting at bottom row and going up
      let emptySpace = false;
      for (let row = this.dim - 1; row >= 0; row--) {
        const curTile = this.tiles[row][col];

        if ((curTile === TILE_EMPTY) || (curTile === TILE_GOAL)) {
          emptySpace = true;
          continue;
        }

        if (curTile === TILE_BLOCK) {
          emptySpace = false;
          continue;
        }

        if (itemIsShape(curTile)) {
          if (!this.shapeCanMove[curTile]) {
            emptySpace = false;
            continue;
          }
        }

        // the only options left are:
        // diamond, single tile (not implemented yet), and shape that can move
        // something we can move!

        if (!emptySpace) {
          continue;
        }

        // empty space, okay to move
        didMove = true;
        this.tiles[row + 1][col] = curTile;
        this.tiles[row][col] = TILE_EMPTY;
      }
    }

    // if the level has a goal
    if(this.goal.row !== -1) {
      const goalTile = this.tiles[this.goal.row][this.goal.col];
      if ((goalTile === TILE_DIAMOND) || (goalTile === TILE_EMPTY)) {
        // delete diamond or replace goal
        this.tiles[this.goal.row][this.goal.col] = TILE_GOAL;
      }
    }

    return didMove;
  }

  toString() {
    return this.tiles.map(x => x.join('')).join('\n');
  }
}

exports.LEVEL = LEVEL;
