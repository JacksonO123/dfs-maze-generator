import { Vector2, vector2 } from "simulationjsv2";

export class Graph<K, V> {
  private values: Map<K, V>;
  private connections: Map<K, K[]>;
  private kenFn: (val: V) => K;

  constructor(keyFn: (val: V) => K) {
    this.connections = new Map();
    this.values = new Map();
    this.kenFn = keyFn;
  }

  addConnection(from: V, to: V) {
    const fromKey = this.kenFn(from);
    const toKey = this.kenFn(to);

    this.values.set(fromKey, from);
    this.values.set(toKey, to);

    const connections = this.connections.get(fromKey) || [];
    connections.push(toKey);

    this.connections.set(fromKey, connections);
  }

  connectionsFromKey(key: K) {
    return this.connections.get(key);
  }

  fromKey(key: K) {
    return this.values.get(key);
  }
}

const vectorToKey = (mazeLen: number, vec: Vector2) =>
  vec[0] * ((mazeLen - 1) / 2) + vec[1];

const generateMazeGraph = (maze: number[][]) => {
  const graph = new Graph<number, Vector2>((vec: Vector2) =>
    vectorToKey(maze[0].length, vec),
  );

  for (let i = 1; i < maze.length - 1; i += 2) {
    for (let j = 1; j < maze[i].length - 1; j += 2) {
      const pos = vector2(i, j);

      if (i > 1) graph.addConnection(pos, vector2(i - 2, j));
      if (j > 1) graph.addConnection(pos, vector2(i, j - 2));
      if (i < maze.length - 2) graph.addConnection(pos, vector2(i + 2, j));
      if (j < maze[i].length - 2) graph.addConnection(pos, vector2(i, j + 2));
    }
  }

  return graph;
};

export const initMaze = (rows: number, cols: number) =>
  Array<number[]>(rows)
    .fill([])
    .map(() => Array<number>(cols).fill(0));

export const cloneMaze = (maze: number[][]) => maze.map((row) => [...row]);

const getFilteredConnections = <T, K>(
  graph: Graph<T, K>,
  key: T,
  visited: Set<T>,
) => {
  return graph.connectionsFromKey(key)!.filter((item) => !visited.has(item));
};

const addStartEnd = (maze: number[][]) => {
  maze[0][1] = 1;

  maze[maze.length - 1][maze[maze.length - 1].length - 2] = 1;

  return maze;
};

export const generateMaze = (rows: number, cols: number) => {
  const maze = initMaze(rows, cols);
  const steps: [number, number][] = [];

  const graph = generateMazeGraph(maze);
  const visited: Set<number> = new Set();
  const idStack: number[] = [vectorToKey(cols, vector2(1, 1))];

  for (let i = 0; i < rows * cols; i++) {
    if (idStack.length === 0) break;

    const prevKey = idStack[idStack.length - 2];
    const key = idStack[idStack.length - 1];

    visited.add(key);

    const pos = graph.fromKey(key)!;

    if (prevKey) {
      const prevPos = graph.fromKey(prevKey)!;

      const midPos = vector2(
        (pos[0] + prevPos[0]) / 2,
        (pos[1] + prevPos[1]) / 2,
      );

      if (maze[midPos[0]][midPos[1]] === 0) {
        steps.push([midPos[0], midPos[1]]);
      }

      maze[midPos[0]][midPos[1]] = 1;
    }

    if (maze[pos[0]][pos[1]] === 0) {
      steps.push([pos[0], pos[1]]);
    }

    maze[pos[0]][pos[1]] = 1;

    const connections = getFilteredConnections(graph, key, visited);

    if (connections.length === 0) {
      idStack.pop();
      continue;
    }

    idStack.push(connections[Math.floor(Math.random() * connections.length)]);
  }

  addStartEnd(maze);
  steps.push([0, 1]);
  steps.push([maze[0].length - 1, maze.length - 2]);

  return [maze, steps] as const;
};
