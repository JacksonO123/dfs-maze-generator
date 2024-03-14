import { Vector2, vector2 } from "simulationjsv2";

export class Graph<K, V> {
  private values: Map<K, V>;
  private connections: Map<K, K[]>;
  private idFn: (val: V) => K;

  constructor(idFn: (val: V) => K) {
    this.connections = new Map();
    this.values = new Map();
    this.idFn = idFn;
  }

  addConnection(from: V, to: V) {
    const fromId = this.idFn(from);
    const toId = this.idFn(to);

    this.values.set(fromId, from);
    this.values.set(toId, to);

    const connections = this.connections.get(fromId) || [];
    connections.push(toId);

    this.connections.set(fromId, connections);
  }

  connectionsFromKey(key: K) {
    return this.connections.get(key);
  }

  fromKey(key: K) {
    return this.values.get(key);
  }
}

const vectorToId = (mazeLen: number, vec: Vector2) =>
  vec[0] * ((mazeLen - 1) / 2) + vec[1];

const generateMazeGraph = (maze: number[][]) => {
  const graph = new Graph<number, Vector2>((vec: Vector2) =>
    vectorToId(maze.length, vec),
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

const initMaze = (width: number, height: number) =>
  Array(height)
    .fill([])
    .map(() => Array(width).fill(0));

const getFilteredConnections = <T, K>(
  graph: Graph<T, K>,
  key: T,
  visited: Set<T>,
) => {
  return graph.connectionsFromKey(key)!.filter((item) => !visited.has(item));
};

const addStartEnd = (maze: number[][]) => {
  maze[1][0] = 1;

  maze[maze.length - 2][maze[maze.length - 1].length - 1] = 1;

  return maze;
};

export const generateMaze = (width: number, height: number) => {
  const maze = initMaze(width, height);

  const graph = generateMazeGraph(maze);
  const visited: Set<number> = new Set();

  let idStack: number[] = [vectorToId(width, vector2(1, 1))];

  for (let i = 0; i < width * height; i++) {
    if (idStack.length === 0) break;

    const prevKey = idStack[idStack.length - 2];
    const id = idStack[idStack.length - 1];

    visited.add(id);

    const pos = graph.fromKey(id)!;
    maze[pos[0]][pos[1]] = 1;

    if (prevKey) {
      const prevPos = graph.fromKey(prevKey)!;

      const midPos = vector2(
        (pos[0] + prevPos[0]) / 2,
        (pos[1] + prevPos[1]) / 2,
      );

      maze[midPos[0]][midPos[1]] = 1;
    }

    const connections = getFilteredConnections(graph, id, visited);
    if (connections.length === 0) {
      idStack.pop();
      continue;
    }

    idStack.push(connections[Math.floor(Math.random() * connections.length)]);
  }

  addStartEnd(maze);

  return maze;
};
