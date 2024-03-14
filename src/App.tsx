import "./App.css";
import Maze from "./components/Maze";

const App = () => {
  return (
    <div class="root">
      <Maze height={51} width={51} squareSize={10} />
    </div>
  );
};

export default App;
