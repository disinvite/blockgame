const { LEVEL } = require('../lib/level');
const { NESCOLORS } = require('../lib/nescolors');

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

const palette  = [13, 10, 26, 42];
const palette2 = [13, 3, 19, 35];

const blackTile = '00000000000000000000000000000000';
const oneTile = '55555555555555555555555555555555';
const twoTile = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const threeTile = 'ffffffffffffffffffffffffffffffff';

const blockTopLeft = '15557eaa755565556555651565656555';
const blockTopRight = '5554a6bd555d55595559555555595559';
const blockBottomLeft = '65556555655565556555555514040000';
const blockBottomRight = '55555551555155545540551040440000';
const blockTopCenter = '5555ab56555555555555555555555555';
const blockBottomCenter = '55555555555555555555555515040000';
const blockRightCenter = '55555555555d55595559555555595559';
const blockInterior = '55555555555555555555555555555555';
const blockLeftCenter = '65556555755565556555655565556555';

const letterL = 'a000a400a400a400a400a400aaa81555';
const letterE = 'aaa8a555a400aaa8a555a400aaa81555';
const letterV = 'a028a429a429a8a92aa50a9402500040';
const letterM = 'a028a8a9aaa9aaa9a669a469a4291415';
const letterO = '2aa0a568a429a429a429a4292aa50554';
const letterS = '2aa0a568a4052aa00568a0292aa50554';
const letterI = '2aa8029502900290029002902aa80555';
const letterT = '2aa80295029002900290029002900050';

const PATTERNTABLE = [
  blackTile,
  oneTile,
  twoTile,
  threeTile,
  blockTopLeft,
  blockTopRight,
  blockBottomLeft,
  blockBottomRight,
  blockTopCenter,
  blockBottomCenter,
  blockRightCenter,
  blockInterior,
  blockLeftCenter,
  letterL,
  letterE,
  letterV,
  letterM,
  letterO,
  letterS,
  letterI,
  letterT
];

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

class GRAPHICS {
  constructor() {
    this.display = new DISPLAY();
    this.display.palettes = [palette, palette2, palette, palette];
    this.display.patterntable = PATTERNTABLE;
    this.setup();
  }
  debug(level) {
    const debugEl = document.getElementById('debug');
    let deText = 'LEVEL\n~~~~~\n\n' + level.tiles.map(x => x.map(y => y.padEnd(6, ' ')).join(' | ')).join('\n');
    deText += '\n\n\n\nMETASPRITES\n~~~~~~~~~~~\n\n' + level.metasprites.map(x => x.map(y => y.padEnd(6, ' ')).join(' | ')).join('\n');
    debugEl.innerHTML = deText;
  }
  // called once.
  setup() {
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 30; j++) {
        this.display.setNametable(i, j, PATTERNTABLE.indexOf(twoTile));
      }
    }

    for (let i = 24; i < 32; i++) {
      for (let j = 0; j < 30; j++) {
        // 0 = blackTile
        this.display.setNametable(i, j, PATTERNTABLE.indexOf(blackTile));
      }
    }

    this.display.setNametable(25, 8, PATTERNTABLE.indexOf(letterL));
    this.display.setNametable(26, 8, PATTERNTABLE.indexOf(letterE));
    this.display.setNametable(27, 8, PATTERNTABLE.indexOf(letterV));
    this.display.setNametable(28, 8, PATTERNTABLE.indexOf(letterE));
    this.display.setNametable(29, 8, PATTERNTABLE.indexOf(letterL));

    this.display.setNametable(29, 10, PATTERNTABLE.indexOf(letterO));

    this.display.setNametable(25, 13, PATTERNTABLE.indexOf(letterM));
    this.display.setNametable(26, 13, PATTERNTABLE.indexOf(letterO));
    this.display.setNametable(27, 13, PATTERNTABLE.indexOf(letterV));
    this.display.setNametable(28, 13, PATTERNTABLE.indexOf(letterE));
    this.display.setNametable(29, 13, PATTERNTABLE.indexOf(letterS));

    this.display.setNametable(29, 15, PATTERNTABLE.indexOf(letterO));

    this.display.setNametable(25, 18, PATTERNTABLE.indexOf(letterI));
    this.display.setNametable(26, 18, PATTERNTABLE.indexOf(letterT));
    this.display.setNametable(27, 18, PATTERNTABLE.indexOf(letterE));
    this.display.setNametable(28, 18, PATTERNTABLE.indexOf(letterM));
    this.display.setNametable(29, 18, PATTERNTABLE.indexOf(letterS));

    this.display.setNametable(29, 20, PATTERNTABLE.indexOf(letterO));

    for (let i = 12; i < 15; i++) {
      for (let j = 4; j < 11; j++) {
        this.display.setAttribute(i, j, 1);
      }
    }
  }
  draw(level) {
    this.debug(level);
    const levelSize = level.dim;

    for (let row = 0; row < levelSize; row++) {
      for (let col = 0; col < levelSize; col++) {
        const tile = level.tiles[row][col];

        if ((tile === 'A') || (tile === 'B') || (tile === 'C')) {
          const metaInfo = level.metasprites[row][col].split('~')[1];

          // idiomatic, yes. but also idiotic
          const hasU = (metaInfo.indexOf('U') !== -1);
          const hasD = (metaInfo.indexOf('D') !== -1);
          const hasL = (metaInfo.indexOf('L') !== -1);
          const hasR = (metaInfo.indexOf('R') !== -1);
          
          let sprTopLeft = '';
          let sprTopRight = '';
          let sprBottomLeft = '';
          let sprBottomRight = '';

          // top left
          if(hasU && hasL) {
            sprTopLeft = blockTopLeft;
          } else if (!hasU && hasL) {
            sprTopLeft = blockLeftCenter;
          } else if (hasU && !hasL) {
            sprTopLeft = blockTopCenter;
          } else {
            sprTopLeft = blockInterior;
          }

          // top right
          if(hasU && hasR) {
            sprTopRight = blockTopRight;
          } else if (!hasU && hasR) {
            sprTopRight = blockRightCenter;
          } else if (hasU && !hasR) {
            sprTopRight = blockTopCenter;
          } else {
            sprTopRight = blockInterior;
          }

          // bottom left
          if(hasD && hasL) {
            sprBottomLeft = blockBottomLeft;
          } else if (!hasD && hasL) {
            sprBottomLeft = blockLeftCenter;
          } else if (hasD && !hasL) {
            sprBottomLeft = blockBottomCenter;
          } else {
            sprBottomLeft = blockInterior;
          }

          // bottom right
          if(hasD && hasR) {
            sprBottomRight = blockBottomRight;
          } else if (!hasD && hasR) {
            sprBottomRight = blockRightCenter;
          } else if (hasD && !hasR) {
            sprBottomRight = blockBottomCenter;
          } else {
            sprBottomRight = blockInterior;
          }

          this.display.setNametable(2 + (2*col), 4 + (2*row), PATTERNTABLE.indexOf(sprTopLeft));
          this.display.setNametable(2 + 1 + (2*col), 4 + (2*row), PATTERNTABLE.indexOf(sprTopRight));
          this.display.setNametable(2 + (2 * col), 4 + 1 + (2*row), PATTERNTABLE.indexOf(sprBottomLeft));
          this.display.setNametable(2 + 1 + (2*col), 4 + 1 + (2*row),  PATTERNTABLE.indexOf(sprBottomRight));
          this.display.setAttribute(1 + col, 2 + row, 1);

        } else {
          let xTile = '';
          if (tile === '$') {
            xTile = PATTERNTABLE.indexOf(threeTile);
          } else if (tile === '.') {
            xTile = PATTERNTABLE.indexOf(blackTile);
          } else {
            xTile = PATTERNTABLE.indexOf(twoTile);
          }

          this.display.setNametable(2 + (2*col), 4 + (2*row), xTile);
          this.display.setNametable(2 + 1 + (2*col), 4 + (2*row), xTile);
          this.display.setNametable(2 + (2 * col), 4 + 1 + (2*row), xTile);
          this.display.setNametable(2 + 1 + (2*col), 4 + 1 + (2*row), xTile);
          this.display.setAttribute(1 + col, 2 + row, 0);
        }
      }
    }

    this.display.draw();
  }
};

window.pushUp = () => {
  window.l.slideUp();
  window.g.draw(window.l);
}

window.pushLeft = () => {
  window.l.slideLeft();
  window.g.draw(window.l);
}

window.pushRight = () => {
  window.l.slideRight();
  window.g.draw(window.l);
}

window.pushDown = () => {
  window.l.slideDown();
  window.g.draw(window.l);
}

window.onload = () => {
  const s = [
    '..... . A^',
    '......... ',
    '......C$. ',
    '......C.. ',
    '.....B    ',
    '..........',
    '..........',
    '..........',
    '..........',
    '..........',
  ];

  window.l = new LEVEL(s.join('\n'));
  window.g = new GRAPHICS();
  window.g.draw(window.l);
};