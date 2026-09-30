/*
 * algorithms.js
 * BFS, DFS, Coste Uniforme y A*
 *
 * Cada celda puede tener:
 *   wall       -> obstáculo
 *   weight     -> coste de entrar en esa celda
 *   goalCost   -> coste adicional de esa meta
 */

const DIRECTIONS = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1]
];

function nodeKey(node) {
  return `${node.row},${node.col}`;
}

function sameNode(a, b) {
  return a.row === b.row && a.col === b.col;
}

function getNeighbors(node, grid) {
  const neighbors = [];

  for (const [dr, dc] of DIRECTIONS) {
    const row = node.row + dr;
    const col = node.col + dc;

    if (
      row >= 0 &&
      row < grid.length &&
      col >= 0 &&
      col < grid[0].length &&
      !grid[row][col].wall
    ) {
      neighbors.push({ row, col });
    }
  }

  return neighbors;
}

function getMoveCost(grid, node) {
  return grid[node.row][node.col].weight || 1;
}

function getGoalCost(grid, node) {
  return grid[node.row][node.col].goalCost || 0;
}

function reconstructPath(parent, start, goal) {
  const path = [];
  let current = nodeKey(goal);

  while (current) {
    const [row, col] = current.split(",").map(Number);
    path.push({ row, col });

    if (current === nodeKey(start)) break;

    current = parent.get(current);
  }

  if (!path.length || !sameNode(path[path.length - 1], start)) {
    return [];
  }

  return path.reverse();
}

/* ================= BFS ================= */

function bfs(grid, start, goal) {
  const queue = [start];
  const visited = new Set([nodeKey(start)]);
  const parent = new Map();
  const explored = [];

  while (queue.length) {
    const current = queue.shift();
    explored.push(current);

    if (sameNode(current, goal)) {
      const path = reconstructPath(parent, start, goal);

      return {
        found: true,
        explored,
        path,
        cost: path.length - 1
      };
    }

    for (const next of getNeighbors(current, grid)) {
      const k = nodeKey(next);

      if (!visited.has(k)) {
        visited.add(k);
        parent.set(k, nodeKey(current));
        queue.push(next);
      }
    }
  }

  return { found: false, explored, path: [], cost: Infinity };
}

/* ================= DFS ================= */

function dfs(grid, start, goal) {
  const stack = [start];
  const visited = new Set([nodeKey(start)]);
  const parent = new Map();
  const explored = [];

  while (stack.length) {
    const current = stack.pop();
    explored.push(current);

    if (sameNode(current, goal)) {
      const path = reconstructPath(parent, start, goal);

      return {
        found: true,
        explored,
        path,
        cost: path.length - 1
      };
    }

    const neighbors = getNeighbors(current, grid);

    for (let i = neighbors.length - 1; i >= 0; i--) {
      const next = neighbors[i];
      const k = nodeKey(next);

      if (!visited.has(k)) {
        visited.add(k);
        parent.set(k, nodeKey(current));
        stack.push(next);
      }
    }
  }

  return { found: false, explored, path: [], cost: Infinity };
}

/* ================= COSTE UNIFORME ================= */

function uniformCostSearch(grid, start, goal) {
  const frontier = [{ node: start, cost: 0 }];
  const bestCost = new Map([[nodeKey(start), 0]]);
  const parent = new Map();
  const explored = [];

  while (frontier.length) {
    frontier.sort((a, b) => a.cost - b.cost);

    const currentItem = frontier.shift();
    const current = currentItem.node;
    const currentKey = nodeKey(current);

    if (currentItem.cost !== bestCost.get(currentKey)) {
      continue;
    }

    explored.push(current);

    if (sameNode(current, goal)) {
      return {
        found: true,
        explored,
        path: reconstructPath(parent, start, goal),
        cost: currentItem.cost + getGoalCost(grid, goal)
      };
    }

    for (const next of getNeighbors(current, grid)) {
      const newCost = currentItem.cost + getMoveCost(grid, next);
      const k = nodeKey(next);

      if (!bestCost.has(k) || newCost < bestCost.get(k)) {
        bestCost.set(k, newCost);
        parent.set(k, currentKey);
        frontier.push({ node: next, cost: newCost });
      }
    }
  }

  return { found: false, explored, path: [], cost: Infinity };
}

/* ================= A* ================= */

function heuristic(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function aStar(grid, start, goal) {
  const frontier = [{
    node: start,
    g: 0,
    f: heuristic(start, goal)
  }];

  const bestG = new Map([[nodeKey(start), 0]]);
  const parent = new Map();
  const explored = [];

  while (frontier.length) {
    frontier.sort((a, b) => a.f - b.f);

    const currentItem = frontier.shift();
    const current = currentItem.node;
    const currentKey = nodeKey(current);

    if (currentItem.g !== bestG.get(currentKey)) {
      continue;
    }

    explored.push(current);

    if (sameNode(current, goal)) {
      return {
        found: true,
        explored,
        path: reconstructPath(parent, start, goal),
        cost: currentItem.g + getGoalCost(grid, goal)
      };
    }

    for (const next of getNeighbors(current, grid)) {
      const newG = currentItem.g + getMoveCost(grid, next);
      const k = nodeKey(next);

      if (!bestG.has(k) || newG < bestG.get(k)) {
        bestG.set(k, newG);
        parent.set(k, currentKey);

        frontier.push({
          node: next,
          g: newG,
          f: newG + heuristic(next, goal)
        });
      }
    }
  }

  return { found: false, explored, path: [], cost: Infinity };
}
