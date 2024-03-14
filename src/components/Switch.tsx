import { createSignal } from "@jacksonotto/pulse";
import "./Switch.scss";

type SwitchProps = {
  onChange: (active: boolean) => void;
  children: string;
};

const Switch = (props: SwitchProps) => {
  const [active, setActive] = createSignal(false);

  const handleClick = () => {
    setActive((prev) => !prev);
    props.onChange(active());
  };

  return (
    <div class="switch-wrapper">
      <label class="switch">
        <input type="checkbox" onClick={handleClick} />
        <span class={`slider ${active() ? "active" : "inactive"}`}></span>
      </label>
      <span class="label">{props.children}</span>
    </div>
  );
};

export default Switch;
