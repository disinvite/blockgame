// the hope is to make this as generic as possible.
// just send in the patterntable, nametable, attributes.
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

class DISPLAY {
  constructor() {
    const canvas = document.getElementById('c');
    this.ctx = canvas.getContext('2d');
    this.ctx.scale(2, 2);
    this.ctx.imageSmoothingEnabled = false;
    
    // stored in the format from the "colorthing" program
    this.patterntable = new Array(256);

    // (960) characters in 30x32 array + (64) attribute table in 15x16 array
    this.characters = new Array(960).fill(0);
    this.attributes = new Array(240).fill(0);
    this.palettes = new Array(4);

    // ImageBitmap cache
    this.cache = {};

    this.offscreen = new OffscreenCanvas(8, 8); //document.createElement('canvas');

    // black screen
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0,0,256,240);
  }
  setAttribute(x, y, which) {
    this.attributes[(y * 16) + x] = which;
  }
  setNametable(x, y, which) {
    this.characters[(y * 32) + x] = which;
  }
  addToCache(which, pal) {
    const spriteArr = undoHex(which);
    const id = `${which},${pal}`;
    const offscreenCtx = this.offscreen.getContext('2d');

    offscreenCtx.fillStyle = '#000000';
    offscreenCtx.fillRect(0, 0, 8, 8);

    for (let tx = 0; tx < 8; tx++) {
      for (let ty = 0; ty < 8; ty++) {
        const whichColor = spriteArr[(ty * 8) + tx];
        offscreenCtx.fillStyle = NESCOLORS[pal[whichColor]];
        offscreenCtx.fillRect(tx, ty, 1, 1);
      }
    }

    this.cache[id] = this.offscreen.transferToImageBitmap();
  }
  drawSprite(x, y, which, pal) {
    const id = `${which},${pal}`;
    if (!(id in this.cache)) {
      this.addToCache(which, pal);
    }

    this.ctx.drawImage(this.cache[id], x, y, 8, 8);
  }
  draw() {
    for (let row = 0; row < 30; row++) {
      for (let col = 0; col < 32; col++) {
        const char = (row * 32) + col;
        const attr = (Math.floor(row / 2.0) * 16) + Math.floor(col / 2.0);

        const sprite = this.patterntable[this.characters[char]];
        const pal = this.palettes[this.attributes[attr]];
        this.drawSprite(col * 8, row * 8, sprite, pal);
      }
    }
  }
}

module.exports = DISPLAY;
