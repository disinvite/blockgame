const { NESCOLORS } = require('./nescolors');

// taken from colorthing
function undoHex(hexChr) {
  const arrayOut = [];

  for(let i = 0; i < 32; i+= 4) {
    const piece = hexChr.slice(i, i + 4);
    const binary = parseInt(piece,16).toString(2).padStart(16,'0');
    for(let j = 0; j < 16; j += 2) {
      const twobit = binary.slice(j, j + 2);
      arrayOut.push(parseInt(twobit,2));
    }
  }

  return arrayOut;
}

class PPU {
  constructor(pattern) {
    this.patterntable = [...pattern].map(undoHex);
    const pal = [13, 10, 26, 42];
    this.bgPalettes = [pal, pal, pal, pal];
    
    // hex to rgba. rgba is in reverse order so we have to flip the color pairs
    // this would be a great thing to precache in the NESCOLORS class
    this.nesColorsLocal = [...NESCOLORS].map(x => {
      const y = [x.slice(5,7),x.slice(3,5),x.slice(1,3)];
      return parseInt(y.join(''),16);
    });

    // nametable 0
    this.characters = new Array(960).fill(0);
    this.attributes = new Array(240).fill(0);

    this.offscreen = new OffscreenCanvas(256, 240); //document.createElement('canvas');
    this.offscreenCtx = this.offscreen.getContext('2d');
    this.imageData = this.offscreenCtx.getImageData(0, 0, 256, 240);
    this.buf = new ArrayBuffer(this.imageData.data.length);
    this.buf8 = new Uint8ClampedArray(this.buf);
    this.buf32 = new Uint32Array(this.buf);
  }

  setAttribute(x, y, which) {
    this.attributes[(y * 16) + x] = which;
  }

  setNametable(x, y, which) {
    this.characters[(y * 32) + x] = which;
  }

  frame() {
    let buf_i = 0;
    for (let row = 0; row < 30; row++) {
      for (let col = 0; col < 32; col++) {
        const char = (row * 32) + col;
        const attr = (Math.floor(row / 2.0) * 16) + Math.floor(col / 2.0);

        const sprite = this.patterntable[this.characters[char]];
        const pal = this.bgPalettes[this.attributes[attr]];

        for (let ti = 0; ti < 8; ti++) {
          for (let tj = 0; tj < 8; tj++) {
            buf_i = (row * 2048) + (ti * 256) + (col * 8) + tj; 
            const whichColor = sprite[(ti * 8) + tj];
            this.buf32[buf_i] = 0xff000000 | this.nesColorsLocal[pal[whichColor]];
          }
        }
      }
    }
    this.imageData.data.set(this.buf8);
    this.offscreenCtx.putImageData(this.imageData, 0, 0);
  }
}

module.exports = PPU;
