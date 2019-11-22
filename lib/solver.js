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

function goDirection(levelStr, which) {
  const level = new LEVEL(levelStr);
  switch(which) {
    case 'up':
      level.slideUp();
      break;
    case 'down':
      level.slideDown();
      break;
    case 'left':
      level.slideLeft();
      break;
    case 'right':
      level.slideRight();
      break;
  }
  return getKey(level);
}

function isWinner(levelStr) {
  const level = new LEVEL(levelStr);
  return level.diamonds === 0;
}

// for now. maybe get fancy with alphanumerics later
function getKey(level) {
  return level.toString();
}

function haha(graph, winningMoves) {
  const dirs = ['up', 'down', 'left', 'right'];

  const vertices = Object.keys(graph);
  const edges = [];

  // build a real (V,E) graph
  for (const key in graph) {
    const directions = graph[key];

    // if this is not a winning position
    if (winningMoves.indexOf(key) !== -1) {
      continue;
    } else {
      for (const dir of dirs) {
        const next = directions[dir];
        if (key !== next) {
          edges.push([key, next]);
        }
      }
    }
  }

  console.log(edges.length);

  // step two!
  const destinationQueue = [...winningMoves];
  while (destinationQueue.length > 0) {
    const current = destinationQueue.shift();
    vertices.splice(vertices.indexOf(current),1);

    // which edges point at the current node?
    const edgesWeWant = edges.filter(([x,y]) => y === current);
    
    for (const e of edgesWeWant) {
      // to prevent cycles
      edges.splice(edges.indexOf(e),1);
      // source node is now a winnable position, so let's check it
      destinationQueue.push(e[0]);
    }
  }

  console.log(edges.length);
  console.log(vertices[0]);
}

/*
Build up the complete graph of all possible moves for a given staring position.
It will then be trivial to find the solution at any given point in the game
(which will make interactive debugging and level design much easier.)
*/

function buildGraph(level) {
  const graph = {};
  const dirs = ['up', 'down', 'left', 'right'];

  const start = getKey(level);
  const emptyEdgeStr = JSON.stringify({up: '', down: '', left: '', right: ''});
  const newNodes = () => JSON.parse(emptyEdgeStr); // deep copy each time

  graph[start] = newNodes();
  const queue = [start];
  const winningMoves = [];

  // build up the graph
  while (queue.length > 0) {
    const current = queue.shift();

    // pre-prune by stopping at any winning moves
    if (isWinner(current)) {
      graph[current] = {winner: 1};
      winningMoves.push(current);
      continue;
    }

    const edges = graph[current];
    for (const dir of dirs) {

      // would the edge list ever be partially filled in?
      if (edges[dir] === '') {
        const next = goDirection(current, dir);
        graph[current][dir] = next;

        if (!(next in graph)) {
          queue.push(next);
          graph[next] = newNodes();
        }
      }
    }
  }

  //console.log(Object.keys(graph).length);
  //console.log(graph);
  haha(graph, winningMoves);
}

function solve(level, maxSteps) {
  //return solveRecursive(level, [], [], maxSteps);
  return solveIterative(level, maxSteps);
}

exports.solve = solve;
exports.buildGraph = buildGraph;