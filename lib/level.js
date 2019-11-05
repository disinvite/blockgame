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

    this.willMove = new Array(this.dim * this.dim).fill(true);

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

  buildShapeList() {
    const levelArr = this.tiles.flat();
    const duplicatesRemoved = levelArr
      .filter((item, index) => levelArr.indexOf(item) === index);
    
    /// only the shape characters
    return duplicatesRemoved.filter(itemIsShape);
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
    const dest = new Array(this.dim).fill(0).map(() => new Array(this.dim).fill(0));
    for(let row = 0; row < this.dim; row++) {
      for(let col = 0; col < this.dim; col++) {
        dest[col][row] = this.tiles[this.dim - row - 1][col];
      }
    }
    this.tiles = dest;

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

  pass(row, col, previousTile, backRow, frontRow) {
    let doneWithFirstPass = true;
    const curTile = this.tiles[row][col];

    // because we use it in a few places
    const absIndex = (row * this.dim) + col;

    if ((curTile === TILE_EMPTY) || (curTile === TILE_GOAL)) {
      return doneWithFirstPass;
    }

    // tile should be checked
    if (this.willMove[absIndex]) {
      // nothing in the bottom row is moving.
      if (row === frontRow) {
        this.willMove[absIndex] = false;
        doneWithFirstPass = false;

        if (itemIsShape(curTile)) {
          this.shapeCanMove[curTile] = false;
        }
      } else if (itemIsShape(curTile) && !this.shapeCanMove[curTile]) {
        // this is part of a shape found not to move on a previous run
        this.willMove[absIndex] = false;
        doneWithFirstPass = false;
      }
    }

    // if this tile is not going to move
    if (!this.willMove[absIndex]) {
      // no use checking the top row because there's nothing above it
      if (row === backRow) {
        return doneWithFirstPass;
      }

      // if a blank is above us, fine
      if (this.tiles[previousTile.row][previousTile.col] === TILE_EMPTY) {
        return doneWithFirstPass;
      }

      // the goal counts as a blank space
      if (this.tiles[previousTile.row][previousTile.col] === TILE_GOAL) {
        return doneWithFirstPass;
      }

      // but who is above us? add it to the list
      if ( this.willMove[((previousTile.row * this.dim) + previousTile.col)] ) {
        this.willMove[((previousTile.row * this.dim) + previousTile.col)] = false;
        doneWithFirstPass = false;

        if(itemIsShape(this.tiles[previousTile.row][previousTile.col])) {
          this.shapeCanMove[this.tiles[previousTile.row][previousTile.col]] = false;
        }
      }
    }

    return doneWithFirstPass;
  }

  move(row, col, nextTile, backRow, frontRow) {
    const curTile = this.tiles[row][col];

    // something we can move!
    if ((curTile === TILE_DIAMOND) || (itemIsShape(curTile))) {
      // if this is the bottom row, it ain't goin' anywhere
      if (row === frontRow) {
        return;
      }

      if ( !this.willMove[(row * this.dim) + col] ) {
        return;
      }

      // empty space, okay to move
      if (this.tiles[nextTile.row][nextTile.col] === TILE_EMPTY) {
        this.tiles[nextTile.row][nextTile.col] = curTile;
        
        // if a block is covering the goal, restore it
        if ((row === this.goal.row) && (col === this.goal.col)) {
          this.tiles[row][col] = TILE_GOAL;
        } else {
          this.tiles[row][col] = TILE_EMPTY;
        }
      }

      if (this.tiles[nextTile.row][nextTile.col] === TILE_GOAL) {
        if (curTile === TILE_DIAMOND) {
          //this.diamonds--;
          this.tiles[row][col] = TILE_EMPTY;
        } else {
          this.tiles[nextTile.row][nextTile.col] = curTile;
          this.tiles[row][col] = TILE_EMPTY;
        }
      }
    }
  }

  stepReset() {
    // reset these as they are now stored as part of the object
    Object.keys(this.shapeCanMove).forEach(k => this.shapeCanMove[k] = true);
    this.willMove.fill(true);
    
    // blocks will never ever move
    for (let row = 0; row < this.dim; row++) {
      for (let col = 0; col < this.dim; col++) {
        if (this.tiles[row][col] === TILE_BLOCK) {
          this.willMove[(row * this.dim) + col] = false;
        }
      }
    }
  }

  stepDown() {
    this.stepReset();

    const backRow = 0;
    const frontRow = this.dim - 1;

    let doneWithFirstPass = true;

    do {
      doneWithFirstPass = true;
      // starting at bottom row and going up
      // do it in this (row,col) order to handle stacked shapes.
      for (let row = this.dim - 1; row >= 0; row--) {
        // column order doesn't matter
        for (let col = 0; col < this.dim; col++) {

          const previousTile = {row: row - 1, col: col};
          const ok = this.pass(row,col,previousTile,backRow,frontRow);
          doneWithFirstPass = doneWithFirstPass & ok;

        }
      }
    } while(!doneWithFirstPass);

    // can we use one set of loops for both things?
    
    // starting at bottom row and going up
    for (let row = this.dim - 1; row >= 0; row--) {
      // column order doesn't matter  
      for (let col = 0; col < this.dim; col++) {
        const nextTile = { row: row + 1, col: col};
        this.move(row, col, nextTile, backRow, frontRow)
      }
    }
  }

  toString() {
    return this.tiles.map(x => x.join('')).join('\n');
  }
}

exports.LEVEL = LEVEL;
