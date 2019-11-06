const { LEVEL } = require('./level');

const DIRS = ['U','D','L','R'];

function solveRecursive(level, path, gamestates, stepsRemaining = 20) {
  if (typeof(gamestates) === 'undefined') {
    gamestates = new Array();
  }

  gamestates = [...gamestates, level.toString()];

  if (level.isDone()) {
    return path;
  }

  if (stepsRemaining === 0) {
    return false;
  }

  const lastDir = path.slice(-1);

  for(let i = 0; i < 4; i++) {
    const dir = DIRS[i];
    if ((lastDir === 'U') || (lastDir === 'D')) {
      if ((dir === 'U') || (dir === 'D')) {
        continue;
      }
    } else if ((lastDir === 'L') || (lastDir === 'R')) {
      if ((dir === 'L') || (dir === 'R')) {
        continue;
      }
    }

    // making a copy
    const newLevel = new LEVEL(level.toString());
    if (dir === 'U') {
      newLevel.slideUp();
    } else if (dir === 'D') {
      newLevel.slideDown();
    } else if (dir === 'L') {
      newLevel.slideLeft();
    } else if (dir === 'R') {
      newLevel.slideRight();
    }

    // if we didn't change a damn thing
    if (gamestates.indexOf(newLevel.toString()) !== -1) {
      continue;
    }

    const result = solveRecursive(newLevel, [...path, dir], gamestates, stepsRemaining - 1);
    if (result === false) {
      continue;
    } else {
      return result;
    }
  }

  return false;
}

function tryIt(level, steps) {
  let gamestates = [];
  const newLevel = new LEVEL(level.toString());
  for (let i = 0; i < steps.length; i++) {
    const dir = steps[i];
    if (dir === 'U') {
      newLevel.slideUp();
    } else if (dir === 'D') {
      newLevel.slideDown();
    } else if (dir === 'L') {
      newLevel.slideLeft();
    } else if (dir === 'R') {
      newLevel.slideRight();
    }

    if (gamestates.indexOf(newLevel.toString()) !== -1) {
      return -1;
    }
    gamestates = [...gamestates, dir];
  }
  if (newLevel.isDone()) {
    return 1;
  }
  return 0;
}

function solveIterative(level, maxSteps) {
  let options = [...DIRS];
  let steps = 1;

  while(steps < maxSteps) {
    let newOptions = [];
    for(let i = 0; i < options.length; i++) {
      const opt = options[i];
      const result = tryIt(level, opt);
      if (result === 1) {
        // success
        return opt; // or keep going?
      } else if (result === 0) {
        newOptions = [...newOptions, opt];
      }
    }

    // now build a new list.
    options = [];
    for (let i = 0; i < newOptions.length; i++) {
      const opt = newOptions[i];
      const lastDir = opt.slice(-1);

      for (let j = 0; j < 4; j++) {
        const dir = DIRS[j];
        if ((lastDir === 'U') || (lastDir === 'D')) {
          if ((dir === 'U') || (dir === 'D')) {
            continue;
          }
        } else if ((lastDir === 'L') || (lastDir === 'R')) {
          if ((dir === 'L') || (dir === 'R')) {
            continue;
          }
        }

        options = [...options, (opt + dir)];
      }
    }

    maxSteps++;
  }
}

function solve(level, maxSteps) {
  //return solveRecursive(level, [], [], maxSteps);
  return solveIterative(level, maxSteps);
}

exports.solve = solve;