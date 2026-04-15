import "./styles/main.css";
import { mount } from "./ui/render";

const app = document.querySelector<HTMLElement>("#app");
if (!app) {
  throw new Error("#app missing");
}
mount(app);
