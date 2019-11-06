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
    let movedSomething = false;

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

    let doneWithFirstPass = true;

    do {
      doneWithFirstPass = true;
      // starting at bottom row and going up
      // do it in this (row,col) order to handle stacked shapes.
      for (let row = this.dim - 1; row >= 0; row--) {
        // column order doesn't matter
        for (let col = 0; col < this.dim; col++) {

          const curTile = this.tiles[row][col];

          // because we use it in a few places
          const absIndex = (row * this.dim) + col;

          if ((curTile === TILE_EMPTY) || (curTile === TILE_GOAL)) {
            continue;
          }

          // tile should be checked
          if (this.willMove[absIndex]) {
            // nothing in the bottom row is moving.
            if (row === (this.dim - 1)) {
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
            if (row === 0) {
              continue;
            }

            // if a blank is above us, fine
            if (this.tiles[row - 1][col] === TILE_EMPTY) {
              continue;
            }

            // the goal counts as a blank space
            if (this.tiles[row - 1][col] === TILE_GOAL) {
              continue;
            }

            // but who is above us? add it to the list
            if ( this.willMove[(((row - 1) * this.dim) + col)] ) {
              this.willMove[(((row - 1) * this.dim) + col)] = false;
              doneWithFirstPass = false;

              if(itemIsShape(this.tiles[row - 1][col])) {
                this.shapeCanMove[this.tiles[row - 1][col]] = false;
              }
            }
          }
        }
      }
    } while(!doneWithFirstPass);


    // column order doesn't matter
    for (let col = 0; col < this.dim; col++) {
      // starting at bottom row and going up
      for (let row = this.dim - 1; row >= 0; row--) {
        const curTile = this.tiles[row][col];
        
        if (curTile === TILE_EMPTY) {
          continue;
        }

        if (curTile === TILE_GOAL) {
          continue;
        }

        // something we can move!
        if ((curTile === TILE_DIAMOND) || (itemIsShape(curTile))) {
          // if this is the bottom row, it ain't goin' anywhere
          if (row === (this.dim - 1)) {
            continue;
          }

          if ( !this.willMove[(row * this.dim) + col] ) {
            continue;
          }

          movedSomething = true;

          // empty space, okay to move
          if (this.tiles[row + 1][col] === TILE_EMPTY) {
            this.tiles[row + 1][col] = curTile;
            
            // if a block is covering the goal, restore it
            if ((row === this.goal.row) && (col === this.goal.col)) {
              this.tiles[row][col] = TILE_GOAL;
            } else {
              this.tiles[row][col] = TILE_EMPTY;
            }
          }

          if (this.tiles[row + 1][col] === TILE_GOAL) {
            if (curTile === TILE_DIAMOND) {
              //this.diamonds--;
              this.tiles[row][col] = TILE_EMPTY;
            } else {
              this.tiles[row + 1][col] = curTile;
              this.tiles[row][col] = TILE_EMPTY;
            }
          }
        }
      }
    }
    return movedSomething;
  }

  toString() {
    return this.tiles.map(x => x.join('')).join('\n');
  }
}

exports.LEVEL = LEVEL;
