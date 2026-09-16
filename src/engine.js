import { Background } from "./background.js";
import { ShootingStar } from "./shootingStar.js";
import { Firework } from "./firework.js";
import { Celebration } from "./celebration.js";
import { createRng } from "./rng.js";

/** Orchestrates the scene: sizing, the spawn timer, input and the render loop. */
export class Engine {
  constructor(canvas, config, overlay) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.config = config;
    this.overlay = overlay;
    this.rng = createRng((Date.now() & 0xffff) ^ config.world.seed);
    this.background = new Background(config);
    this.celebration = new Celebration(config);

    this.star = null;
    this.fireworks = [];
    this.spawnTimer = config.shootingStar.firstStarMaxRandomShowMs * Math.random();
    this.score = 0;
    this.shots = 0;
    this.time = 0;
    this.lastTs = 0;

    this._bindEvents();
    this.resize();
  }

  _bindEvents() {
    window.addEventListener("resize", () => this.resize());
    const onPoint = (clientX, clientY) => this._handlePointer(clientX, clientY);
    this.canvas.addEventListener("pointerdown", (e) => {
      onPoint(e.clientX, e.clientY);
    });
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = w;
    this.height = h;
    this.background.resize(w, h);
    this.celebration.resize(w, h, this.ctx);
  }

  _handlePointer(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (this.star && this.star.alive && this.star.hitTest(x, y)) {
      this._hitStar();
    } else if (this.star && this.star.alive) {
      this.shots++;
      this._updateOverlay();
    }
  }

  _hitStar() {
    const head = this.star.head;
    this.fireworks.push(new Firework(this.config, head.x, head.y, this.rng));
    this.star = null;
    this.score++;
    this.shots++;
    this.celebration.trigger(this.ctx);
    this._scheduleNext();
    this._updateOverlay();
  }

  _scheduleNext() {
    const c = this.config.shootingStar;
    this.spawnTimer = c.minDelayMs + Math.random() * (c.maxDelayMs - c.minDelayMs);
  }

  _spawnStar() {
    this.star = new ShootingStar(
      this.config,
      this.width,
      this.height,
      this.background.horizonY,
      this.rng
    );
  }

  _updateOverlay() {
    if (!this.overlay || !this.config.interaction.scoreEnabled) return;
    const acc = this.shots ? Math.round((this.score / this.shots) * 100) : 100;
    this.overlay.textContent = `Trafienia: ${this.score}  ·  Celność: ${acc}%`;
  }

  start() {
    this._updateOverlay();
    const loop = (ts) => {
      if (!this.lastTs) this.lastTs = ts;
      let dt = (ts - this.lastTs) / 1000;
      this.lastTs = ts;
      dt = Math.min(dt, 0.05);
      this.time += dt;
      this._update(dt);
      this._render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  _update(dt) {
    this.background.update(dt);

    if (!this.star) {
      this.spawnTimer -= dt * 1000;
      if (this.spawnTimer <= 0) {
        this._spawnStar();
      }
    } else {
      this.star.update(dt);
      if (!this.star.alive) {
        // Escaped behind the horizon; wait, then send another.
        this.star = null;
        this._scheduleNext();
      }
    }

    for (const fw of this.fireworks) fw.update(dt);
    this.fireworks = this.fireworks.filter((f) => !f.done);
    this.celebration.update(dt);
  }

  _render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    this.background.drawSky(ctx);
    // Shooting star sits behind the mountains so it sinks below the horizon.
    if (this.star && this.star.alive) this.star.draw(ctx);
    this.background.drawMountains(ctx);
    for (const fw of this.fireworks) fw.draw(ctx, this.time);
    this.celebration.draw(ctx, this.time);
    this.background.drawVignette(ctx);

    // Cursor hint over an active star
    if (
      this.config.interaction.cursorHint &&
      this.star &&
      this.star.alive
    ) {
      this.canvas.style.cursor = "crosshair";
    } else {
      this.canvas.style.cursor = "default";
    }
  }
}
