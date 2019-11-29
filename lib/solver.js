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
  const visited = {};

  const reverseEdges = {};
  for (const v of vertices) {
    reverseEdges[v] = [];
  }

  for (const [src, dst] of edges) {
    reverseEdges[dst].push(src);
  }

  const destinationQueue = [...winningMoves];
  while (destinationQueue.length > 0) {
    const current = destinationQueue.shift();
    visited[current] = 1;

    // which edges point at the current node?
    const edgesWeWant = reverseEdges[current];
    
    for (const e of edgesWeWant) {
      // source node is now a winnable position, so let's check it
      // ignore visited
      if(visited[e] !== 1) {
        destinationQueue.push(e);
      }
    }
  }
  return vertices.filter(x => visited[x] !== 1);
}

function haha(graph, winningMoves) {
  const [vertices, edges] = buildVE(graph);
  const noWinScenarios = identifyNoWinScenarios(vertices, edges, winningMoves);

  // crop edges to and from a no-win scenario
  const xEdges = edges.filter(x => {
    return (noWinScenarios.indexOf(x[0]) === -1)
      && (noWinScenarios.indexOf(x[1]) === -1)
  });

  return [vertices, xEdges, noWinScenarios];
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
  const queue = [[start, '']];
  const winningMoves = [];

  // build up the graph
  while (queue.length > 0) {
    const [current, lastDir] = queue.shift();

    // pre-prune by stopping at any winning moves
    if (isWinner(current)) {
      graph[current] = {winner: 1};
      winningMoves.push(current);
      continue;
    }

    const edges = graph[current];
    for (const dir of dirs) {
      if (dir === lastDir) {
        continue;
      }
      const next = goDirection(current, dir, goalPosition);

      // ignore cases where nothing moved
      if (next === current) {
        continue;
      }

      graph[current][dir] = next;

      if (!(next in graph)) {
        queue.push([next, dir]);
        graph[next] = {};
      }
    }
  }

  return [graph, winningMoves];
}

function solve(level, maxSteps) {
  // coming soon
  return '';
}

// return the letter I guess
function whatDirectionPointsToThisOne(moves, which) {
  const dirs = ['up', 'down', 'left', 'right'];
  for (const dir of dirs) {
    if (moves[dir] === which) {
      return dir.slice(0,1).toUpperCase();
    }
  }
  return '~';
}

function shortestPath(vertices, edges, graph, winningMoves) {
  const shortest = {};

  for (const win of winningMoves) {
    shortest[win] = '';
    const visited = [ win ];
    const queue = [ win ];
    while (queue.length > 0) {
      const current = queue.shift();
      const theseAreNext = edges.filter(e => e[1] === current).map(e => e[0]);
      for (const next of theseAreNext) {
        if (visited.indexOf(next) !== -1) {
          continue;
        }

        if (winningMoves.indexOf(next) !== -1) {
          continue;
        }

        visited.push(next);
        const dir = whatDirectionPointsToThisOne(graph[next], current);
        const possibleInsert = dir + shortest[current];

        if (next in shortest) {
          // only update the list if the new movelist is shorter.
          // if this route isn't faster, don't queue up the next nodes
          if (possibleInsert.length < shortest[next].length) {
            shortest[next] = possibleInsert;
            queue.push(next);
          }
        } else {
          shortest[next] = possibleInsert;
          queue.push(next);
        }
      }
    }
  }

  return shortest;
}

function getMeTheSolverFunction(level) {
  // we probably don't need a list of winning or unwinning moves.
  // if there's no edges left, check if you've won
  // if not, you lose.
  // but to get shortest path I guess it helps to have it

  const [graph, winningMoves] = buildGraph(level);
  const [vertices, edges, noWin] = haha(graph, winningMoves);
  console.log(vertices.length);
  console.log(edges.length);
  const shortest = shortestPath(vertices, edges, graph, winningMoves);

  return shortest;
}

exports.solve = solve;
exports.getMeTheSolverFunction = getMeTheSolverFunction;
exports.buildGraph = buildGraph;