import {
  SceneCollection,
  vector2,
  Square,
  Simulation,
  colorf,
} from "simulationjsv2";
import "./Maze.css";
import { onMount } from "@jacksonotto/pulse";
import { generateMaze } from "../utils/graph";

type MazeProps = {
  height: number;
  width: number;
  squareSize: number;
};

const Maze = (props: MazeProps) => {
  const squareCollection = new SceneCollection("squares");

  const generate = () => {
    squareCollection.empty();

    const maze = generateMaze(props.width, props.height);

    for (let i = 0; i < maze.length; i++) {
      for (let j = 0; j < maze[i].length; j++) {
        const square = new Square(
          vector2(i * props.squareSize, j * props.squareSize),
          props.squareSize,
          props.squareSize,
          colorf(maze[i][j] * 255),
        );

        squareCollection.add(square);
      }
    }
  };

  onMount(() => {
    const canvas = new Simulation("canvas");
    canvas.fitElement();
    canvas.start();

    canvas.add(squareCollection);

    generate();
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
