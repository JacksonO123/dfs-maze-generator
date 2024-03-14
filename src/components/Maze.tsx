import {
  SceneCollection,
  vector2,
  Square,
  Simulation,
  colorf,
} from "simulationjsv2";
import "./Maze.css";
import { onMount } from "@jacksonotto/pulse";
import { cloneMaze, generateMaze, initMaze } from "../utils/graph";

type MazeProps = {
  height: number;
  width: number;
  squareSize: number;
  animationDelay?: number;
};

const Maze = (props: MazeProps) => {
  const animate = true;
  const animationDelay = props.animationDelay || 10;
  const squareCollection = new SceneCollection("squares");
  let mazeStates: number[][][] = [];
  let currentState = 0;

  const drawMaze = (maze: number[][]) => {
    squareCollection.empty();

    for (let i = 0; i < maze.length; i++) {
      for (let j = 0; j < maze[i].length; j++) {
        const square = new Square(
          vector2(j * props.squareSize, i * props.squareSize),
          props.squareSize,
          props.squareSize,
          colorf(maze[i][j] * 255),
        );

        squareCollection.add(square);
      }
    }
  };

  const setMazeStates = (steps: [number, number][]) => {
    const emptyMaze = initMaze(props.height, props.width);

    for (let i = 0; i < steps.length; i++) {
      emptyMaze[steps[i][0]][steps[i][1]] = 1;
      const clone = cloneMaze(emptyMaze);
      mazeStates.push(clone);
    }

    currentState = mazeStates.length - 1;
  };

  const generate = () => {
    mazeStates = [];

    const [maze, steps] = generateMaze(props.height, props.width);

    setMazeStates(steps);

    if (animate) {
      for (let i = 0; i < mazeStates.length; i++) {
        setTimeout(() => {
          drawMaze(mazeStates[i]);
        }, i * animationDelay);
      }
    } else {
      drawMaze(maze);
    }
  };

  onMount(() => {
    const canvas = new Simulation("canvas");
    canvas.fitElement();
    canvas.start();

    canvas.add(squareCollection);

    generate();

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") Math.max(currentState--, 0);
      else if (e.key === "ArrowRight")
        Math.min(currentState++, mazeStates.length - 1);

      drawMaze(mazeStates[currentState]);
    });
  });

  return (
    <div
      class="maze"
      style={{
        height: `${props.height * props.squareSize}px`,
        width: `${props.width * props.squareSize}px`,
      }}
    >
      <button onClick={generate}>Generate</button>
      <canvas id="canvas" />
    </div>
  );
};

export default Maze;
