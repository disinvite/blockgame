/*
Should we require that levels are square? For simplicity, so we only need to
store one variable for the "size" of the map? Should the editor automatically
pad levels with blank space to accomplish this?

How should levels be stored? On the real system we won't have array access so
is it worth getting used to stepping through it as a flat string?
*/

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
    return duplicatesRemoved.filter(item => (item >= 'A') && (item <= 'F'));
  }

  stepDown() {
    const shapeList = this.buildShapeList();
    const notMovingList = [' '];

    // first pass: which shapes can move?
    if (shapeList.length > 0) {
      // starting at bottom row and going up
      // do it in this (row,col) order to handle stacked shapes.
      for (let row = this.dim - 1; row >= 0; row--) {
        // column order doesn't matter
        for (let col = 0; col < this.dim; col++) {
          // if this tile is not going to move
          if ( notMovingList.includes( this.tiles[row][col] ) ) {
            // no use checking the top row because there's nothing above it
            if (row === 0) {
              continue;
            }

            // who is above us? add it to the list
            if ( shapeList.includes( this.tiles[row - 1][col] ) ) {
              notMovingList.push( this.tiles[row - 1][col] );
            }
          }
        }
      }
    }

    // column order doesn't matter
    for (let col = 0; col < this.dim; col++) {
      // starting at bottom row and going up
      for (let row = this.dim - 1; row >= 0; row--) {
        const curTile = this.tiles[row][col];
        
        if (curTile === '.') {
          continue;
        }

        // something we can move!
        if ((curTile === '$') || (shapeList.includes(curTile))) {
          // if this is the bottom row, it ain't goin' anywhere
          if (row === (this.dim - 1)) {
            continue;
          }

          if (notMovingList.includes(curTile)) {
            continue;
          }

          // empty space, okay to move
          if (this.tiles[row + 1][col] === '.') {
            this.tiles[row + 1][col] = curTile;
            this.tiles[row][col] = '.';
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
