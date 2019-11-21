const { LEVEL } = require('../lib/level');
const DISPLAY = require('../lib/display');
const PATTERN = require('../src/pattern');

const palette  = [13, 10, 26, 42];
const palette2 = [13, 3, 19, 35];

class GRAPHICS {
  constructor() {
    this.display = new DISPLAY();
    this.display.palettes = [palette, palette2, palette, palette];
    this.display.patterntable = PATTERN.PATTERNTABLE;
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
        this.display.setNametable(i, j, PATTERN('twoTile'));
      }
    }

    for (let i = 24; i < 32; i++) {
      for (let j = 0; j < 30; j++) {
        // 0 = blackTile
        this.display.setNametable(i, j, PATTERN('blackTile'));
      }
    }

    this.display.setNametable(25, 8, PATTERN('letterL'));
    this.display.setNametable(26, 8, PATTERN('letterE'));
    this.display.setNametable(27, 8, PATTERN('letterV'));
    this.display.setNametable(28, 8, PATTERN('letterE'));
    this.display.setNametable(29, 8, PATTERN('letterL'));

    this.display.setNametable(29, 10, PATTERN('letterO'));

    this.display.setNametable(25, 13, PATTERN('letterM'));
    this.display.setNametable(26, 13, PATTERN('letterO'));
    this.display.setNametable(27, 13, PATTERN('letterV'));
    this.display.setNametable(28, 13, PATTERN('letterE'));
    this.display.setNametable(29, 13, PATTERN('letterS'));

    this.display.setNametable(29, 15, PATTERN('letterO'));

    this.display.setNametable(25, 18, PATTERN('letterI'));
    this.display.setNametable(26, 18, PATTERN('letterT'));
    this.display.setNametable(27, 18, PATTERN('letterE'));
    this.display.setNametable(28, 18, PATTERN('letterM'));
    this.display.setNametable(29, 18, PATTERN('letterS'));

    this.display.setNametable(29, 20, PATTERN('letterO'));

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
          
          let sprTopLeft;
          let sprTopRight;
          let sprBottomLeft;
          let sprBottomRight;

          // top left
          if(hasU && hasL) {
            sprTopLeft = PATTERN('blockTopLeft');
          } else if (!hasU && hasL) {
            sprTopLeft = PATTERN('blockLeftCenter');
          } else if (hasU && !hasL) {
            sprTopLeft = PATTERN('blockTopCenter');
          } else {
            sprTopLeft = PATTERN('blockInterior');
          }

          // top right
          if(hasU && hasR) {
            sprTopRight = PATTERN('blockTopRight');
          } else if (!hasU && hasR) {
            sprTopRight = PATTERN('blockRightCenter');
          } else if (hasU && !hasR) {
            sprTopRight = PATTERN('blockTopCenter');
          } else {
            sprTopRight = PATTERN('blockInterior');
          }

          // bottom left
          if(hasD && hasL) {
            sprBottomLeft = PATTERN('blockBottomLeft');
          } else if (!hasD && hasL) {
            sprBottomLeft = PATTERN('blockLeftCenter');
          } else if (hasD && !hasL) {
            sprBottomLeft = PATTERN('blockBottomCenter');
          } else {
            sprBottomLeft = PATTERN('blockInterior');
          }

          // bottom right
          if(hasD && hasR) {
            sprBottomRight = PATTERN('blockBottomRight');
          } else if (!hasD && hasR) {
            sprBottomRight = PATTERN('blockRightCenter');
          } else if (hasD && !hasR) {
            sprBottomRight = PATTERN('blockBottomCenter');
          } else {
            sprBottomRight = PATTERN('blockInterior');
          }

          this.display.setNametable(2 + (2*col), 4 + (2*row), sprTopLeft);
          this.display.setNametable(2 + 1 + (2*col), 4 + (2*row), sprTopRight);
          this.display.setNametable(2 + (2 * col), 4 + 1 + (2*row), sprBottomLeft);
          this.display.setNametable(2 + 1 + (2*col), 4 + 1 + (2*row), sprBottomRight);
          this.display.setAttribute(1 + col, 2 + row, 1);

        } else {
          let xTile = '';
          if (tile === '$') {
            xTile = PATTERN('threeTile');
          } else if (tile === '.') {
            xTile = PATTERN('blackTile');
          } else {
            xTile = PATTERN('twoTile');
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

let gamestate = 'wait';
let direction = '';
let framesLeftToMove = 0;
const FRAMEDELAY = 1;

function gameLoop(time) {
  window.requestAnimationFrame(gameLoop);

  if (gamestate === 'moving') {
    framesLeftToMove--;
    if(framesLeftToMove > 0) {
      return;
    }

    let stillMoving = false;

    switch (direction) {
      case 'up':
        stillMoving = window.l.stepUp();
        framesLeftToMove = FRAMEDELAY;
        break;
      case 'down':
        stillMoving = window.l.stepDown();
        framesLeftToMove = FRAMEDELAY;
        break;
      case 'left':
        stillMoving = window.l.stepLeft();
        framesLeftToMove = FRAMEDELAY;
        break;
      case 'right':
        stillMoving = window.l.stepRight();
        framesLeftToMove = FRAMEDELAY;
        break;
    }
    
    if (!stillMoving) {
      gamestate = 'wait';
    }
  }

  window.g.draw(window.l);
}

/*
  window.l.slideUp();
  window.g.draw(window.l);
*/

window.pushUp = () => {
  if (gamestate === 'moving') {
    return;
  }
  framesLeftToMove = FRAMEDELAY;
  direction = 'up';
  gamestate = 'moving';
}

window.pushLeft = () => {
  if (gamestate === 'moving') {
    return;
  }
  framesLeftToMove = FRAMEDELAY;
  direction = 'left';
  gamestate = 'moving';
}

window.pushRight = () => {
  if (gamestate === 'moving') {
    return;
  }
  framesLeftToMove = FRAMEDELAY;
  direction = 'right';
  gamestate = 'moving';
}

window.pushDown = () => {
  if (gamestate === 'moving') {
    return;
  }
  framesLeftToMove = FRAMEDELAY;
  direction = 'down';
  gamestate = 'moving';
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
  window.requestAnimationFrame(gameLoop);
  //window.g.draw(window.l);
};