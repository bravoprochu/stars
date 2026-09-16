import { Engine } from "./engine.js";
import { config } from "./config.js";

// Celebration text can be passed via URL, e.g. ?text=Bravo%20Sandra!  or  ?name=Sandra
const params = new URLSearchParams(location.search);
const customText = params.get("text");
const customName = params.get("name");
if (customText) config.celebration.text = customText;
else if (customName) config.celebration.text = `Bravo ${customName}!`;

const canvas = document.getElementById("scene");
const overlay = document.getElementById("hud");

const engine = new Engine(canvas, config, overlay);
engine.start();

// Exposed so the scene can be inspected or tweaked live from the console.
window.starScene = engine;
