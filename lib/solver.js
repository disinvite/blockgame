const { LEVEL } = require('./level');

/*
class Solution {
  constructor(level) {
    this.goal = level.goal;
    if (this.goal.x === -1) {
      // throw;
    }
  }
}
*/

function goDirection(levelStr, which, goalPosition) {
  const level = new LEVEL(levelStr);
  level.goal = JSON.parse(JSON.stringify(goalPosition));
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

// build a real (V,E) graph
function buildVE(graph) {
  const dirs = ['up', 'down', 'left', 'right'];
  
  const vertices = Object.keys(graph);
  const edges = [];

  for (const key in graph) {
    const directions = graph[key];

    for (const dir of dirs) {
      // skip non-existent edges
      // this is probably not a great way to do this
      if(!(dir in directions)) {
        continue;
      }
      const next = directions[dir];
      if (key !== next) {
        edges.push([key, next]);
      }
    }
  }

  return [vertices, edges];
}

function identifyNoWinScenarios(vertices, edges, winningMoves) {
  const noWinScenarios = [...vertices];
  const visited = [];

  const destinationQueue = [...winningMoves];
  while (destinationQueue.length > 0) {
    const current = destinationQueue.shift();
    visited.push(current);
    noWinScenarios.splice(noWinScenarios.indexOf(current),1);

    // which edges point at the current node?
    const edgesWeWant = edges.filter(([x,y]) => y === current);
    
    for (const e of edgesWeWant) {
      // source node is now a winnable position, so let's check it
      // ignore visited
      if(visited.indexOf(e[0]) === -1) {
        destinationQueue.push(e[0]);
      }
    }
  }
  return noWinScenarios;
}

function haha(graph, winningMoves) {
  const [vertices, edges] = buildVE(graph);

  console.log(`VERTICES: ${vertices.length}`);
  for (const i in vertices) {
    console.log(`${i}:\n${vertices[i]}\n`);
  }
  
  //console.log(edges.map(e => [vertices.indexOf(e[0]), vertices.indexOf(e[1])]));

  // step two!
  const noWinScenarios = identifyNoWinScenarios(vertices, edges, winningMoves);
  
  console.log('NO WIN:');
  console.log(noWinScenarios.map(v => vertices.indexOf(v)));
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

  // This is needed because we serialize and deserialize with
  // each step, meaning that if a block covers the exit, we won't
  // know where to put it back unless we explicitly say so.
  const goalPosition = JSON.parse(JSON.stringify(level.goal));

  graph[start] = {};
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
      const next = goDirection(current, dir, goalPosition);

      // ignore cases where nothing moved
      if (next === current) {
        continue;
      }

      graph[current][dir] = next;

      if (!(next in graph)) {
        queue.push(next);
        graph[next] = {};
      }
    }
  }

  haha(graph, winningMoves);
}

function solve(level, maxSteps) {
  // coming soon
  return '';
}

exports.solve = solve;
exports.buildGraph = buildGraph;