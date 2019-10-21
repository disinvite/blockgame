class LEVEL {
  constructor(str) {
    this.tiles = str
      .split('\n')
      .filter(x => x.length > 0)
      .map(x => x.split(''));
    this.dim = this.tiles.length;
  }

  stepDown() {
    // starting at bottom row and going up
    for (let row = this.dim - 1; row >= 0; row--) {
      // column order doesn't matter
      for (let col = 0; col < this.dim; col++) {
        // something we can move!
        if (this.tiles[row][col] === '$') {
          // if this is the bottom row, it ain't goin' anywhere
          if (row === (this.dim - 1)) {
            continue;
          }

          // empty space, okay to move
          if (this.tiles[row + 1][col] === '.') {
            this.tiles[row + 1][col] = '$';
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
