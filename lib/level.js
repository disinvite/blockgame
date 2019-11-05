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
    this.tiles = str
      .split('\n')
      .filter(x => x.length > 0)
      .map(x => x.split(''));
    this.dim = this.tiles.length;
  }

  buildShapeList() {
    const levelArr = this.tiles.flat();
    const duplicatesRemoved = levelArr
      .filter((item, index) => levelArr.indexOf(item) === index);
    
    /// only the shape characters
    return duplicatesRemoved.filter(itemIsShape);
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
  }

  /*
  so what is this actually going to look like on the real hardware?
  bitstring of tiles that will move?
  just keep doing the "first" pass until it is stable?

  I wonder if it's less complex to just have every level as its own 12x12
  square (or whatever size) in memory
  */


  stepDown() {
    const shapeList = this.buildShapeList();

    // build this in a smarter way later
    // or not. won't this just be a block in memory?
    const shapeCanMove = {'A': true, 'B': true, 'C': true, 'D': true, 'E': true, 'F': true};
    const willMove = Array(this.dim * this.dim).fill(true);
    
    // blocks will never ever move
    for (let row = 0; row < this.dim; row++) {
      for (let col = 0; col < this.dim; col++) {
        if (this.tiles[row][col] === TILE_BLOCK) {
          willMove[(row * this.dim) + col] = false;
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

          if (curTile === TILE_EMPTY) {
            continue;
          }

          // tile should be checked
          if (willMove[(row * this.dim) + col]) {
            // nothing in the bottom row is moving.
            if (row === (this.dim - 1)) {
              willMove[(row * this.dim) + col] = false;
              doneWithFirstPass = false;

              if (itemIsShape(curTile)) {
                shapeCanMove[curTile] = false;
              }
            } else if (itemIsShape(curTile) && !shapeCanMove[curTile]) {
              // this is part of a shape found not to move on a previous run
              willMove[(row * this.dim) + col] = false;
              doneWithFirstPass = false;
            }
          }

          // if this tile is not going to move
          if (!willMove[(row * this.dim) + col]) {
            // no use checking the top row because there's nothing above it
            if (row === 0) {
              continue;
            }

            // if a blank is above us, fine
            if (this.tiles[row - 1][col] === TILE_EMPTY) {
              continue;
            }

            // but who is above us? add it to the list
            if ( willMove[(((row - 1) * this.dim) + col)] ) {
              willMove[(((row - 1) * this.dim) + col)] = false;
              doneWithFirstPass = false;

              if(itemIsShape(this.tiles[row - 1][col])) {
                shapeCanMove[this.tiles[row - 1][col]] = false;
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

        // something we can move!
        if ((curTile === TILE_DIAMOND) || (itemIsShape(curTile))) {
          // if this is the bottom row, it ain't goin' anywhere
          if (row === (this.dim - 1)) {
            continue;
          }

          if ( !willMove[(row * this.dim) + col] ) {
            continue;
          }

          // empty space, okay to move
          if (this.tiles[row + 1][col] === TILE_EMPTY) {
            this.tiles[row + 1][col] = curTile;
            this.tiles[row][col] = TILE_EMPTY;
          }
        }
      }
    }
  }

  toString() {
    return this.tiles.map(x => x.join('')).join('\n');
  }
}

exports.LEVEL = LEVEL;
