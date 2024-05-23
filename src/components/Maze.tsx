import {
  SceneCollection,
  vector2,
  Square,
  Simulation,
  colorf,
  Camera,
  vector3,
  Instance,
  matrix4,
  mat4,
} from "simulationjsv2";
import Switch from "./Switch";
import { createSignal, onMount } from "@jacksonotto/pulse";
import { cloneMaze, generateMaze, initMaze } from "../utils/graph";
import "./Maze.scss";

type MazeProps = {
  height: number;
  width: number;
  squareSize: number;
  animationDelay?: number;
};

const Maze = (props: MazeProps) => {
  const [animate, setAnimate] = createSignal(false);

  const animationDelay = props.animationDelay || 10;
  const squareCollection = new SceneCollection("squares");
  let mazeStates: number[][][] = [];
  let currentState = 0;

  const square = new Square(
    vector2(),
    props.squareSize,
    props.squareSize,
    colorf(0),
  );

  const squareInstance = new Instance(square, 0);
  squareCollection.add(squareInstance);

  const countOccurances = (maze: number[][], value: number) => {
    let total = 0;

    for (let i = 0; i < maze.length; i++) {
      for (let j = 0; j < maze[i].length; j++) {
        if (maze[i][j] === value) total++;
      }
    }

    return total;
  };

  const drawMaze = (maze: number[][]) => {
    const squareOccurances = countOccurances(maze, 0);

    squareInstance.setNumInstances(squareOccurances);
    const instances = squareInstance.getInstances();

    let squareCount = 0;

    for (let i = 0; i < maze.length; i++) {
      for (let j = 0; j < maze[i].length; j++) {
        if (maze[i][j] === 1) continue;

        const mat = matrix4();
        const pos = vector3(
          j * props.squareSize * devicePixelRatio,
          -i * props.squareSize * devicePixelRatio,
        );
        mat4.translate(mat, pos, mat);

        instances[squareCount] = mat;
        squareCount++;
      }
    }

    squareInstance.setInstance(0, matrix4());
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

  let timeoutIds: number[] = [];
  const generate = () => {
    timeoutIds.forEach((id) => clearTimeout(id));

    drawMaze(initMaze(props.height, props.width));

    mazeStates = [];
    const newTimeoutIds = [];

    const [maze, steps] = generateMaze(props.height, props.width);

    setMazeStates(steps);

    if (animate()) {
      for (let i = 0; i < mazeStates.length; i++) {
        const timeoutId = setTimeout(() => {
          drawMaze(mazeStates[i]);
        }, i * animationDelay);

        newTimeoutIds.push(timeoutId);
      }
    } else {
      drawMaze(maze);
    }

    timeoutIds = newTimeoutIds;
  };

  onMount(() => {
    const showFps = false;
    // const showFps = true;
    const canvas = new Simulation("canvas", new Camera(vector3()), showFps);
    canvas.fitElement();
    canvas.start();

    canvas.add(squareCollection);

    generate();

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        currentState = Math.max(currentState - 1, 0);
        drawMaze(mazeStates[currentState]);
      } else if (e.key === "ArrowRight") {
        currentState = Math.min(currentState + 1, mazeStates.length - 1);
        drawMaze(mazeStates[currentState]);
      }
    });
  });

  const handleAnimateChange = (active: boolean) => {
    setAnimate(active);
  };

  return (
    <div
      class="maze"
      style={{
        height: `${props.height * props.squareSize}px`,
        width: `${props.width * props.squareSize}px`,
      }}
    >
      <div class="controls">
        <button onClick={generate}>Generate</button>
        <Switch onChange={handleAnimateChange}>Animate</Switch>
      </div>
      <canvas id="canvas" />
    </div>
  );
};

export default Maze;
