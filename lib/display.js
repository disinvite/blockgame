// the hope is to make this as generic as possible.
// just send in the patterntable, nametable, attributes.

class DISPLAY {
  constructor() {
    const canvas = document.getElementById('c');
    this.ctx = canvas.getContext('2d');
    this.ctx.scale(2, 2);
    this.ctx.imageSmoothingEnabled = false;
  }
  
  draw(otherCanvas) {
    this.ctx.drawImage(otherCanvas, 0, 0, 256, 240);
  }
}

module.exports = DISPLAY;
