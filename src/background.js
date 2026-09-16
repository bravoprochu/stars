import { createRng } from "./rng.js";

/** Static + twinkling backdrop: sky gradient, star field, milky way and layered mountains. */
export class Background {
  constructor(config) {
    this.config = config;
    this.rng = createRng(config.world.seed);
    this.width = 0;
    this.height = 0;
    this.horizonY = 0;
    this.stars = [];
    this.milky = [];
    this.mountainLayers = [];
    this.time = 0;
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.horizonY = height * this.config.world.horizonRatio;
    this.rng = createRng(this.config.world.seed);
    this._buildStars();
    this._buildMilkyWay();
    this._buildMountains();
    this._buildSkyGradient();
  }

  _buildSkyGradient() {
    // Rebuilt on resize; cached gradient object.
    const g = document
      .createElement("canvas")
      .getContext("2d")
      .createLinearGradient(0, 0, 0, this.horizonY);
    for (const stop of this.config.world.backgroundStops) {
      g.addColorStop(stop.at, stop.color);
    }
    this._skyGradient = g;
  }

  _buildStars() {
    const s = this.config.stars;
    const r = this.rng;
    this.stars = [];
    for (let i = 0; i < s.initStars; i++) {
      const bright = r.chance(s.brightStarChance);
      this.stars.push({
        x: r.range(0, this.width),
        y: r.range(0, this.horizonY * 0.98),
        radius: r.range(s.minRadius, s.maxRadius) * (bright ? 1.8 : 1),
        color: r.pick(s.palette),
        phase: r.range(0, Math.PI * 2),
        speed: r.range(s.minTwinkleSpeed, s.maxTwinkleSpeed),
        bright,
      });
    }
  }

  _buildMilkyWay() {
    const m = this.config.milkyWay;
    this.milky = [];
    if (!m.enabled) return;
    const r = this.rng;
    const cx = this.width * 0.5;
    const cy = this.horizonY * 0.42;
    const band = this.horizonY * m.thickness;
    for (let i = 0; i < m.starCount; i++) {
      const along = r.range(-1, 1);
      const across = (r.next() - 0.5) * (r.next() - 0.5) * 2;
      const px = along * this.width * 0.75;
      const py = across * band;
      const cos = Math.cos(m.tilt);
      const sin = Math.sin(m.tilt);
      this.milky.push({
        x: cx + px * cos - py * sin,
        y: cy + px * sin + py * cos,
        radius: r.range(0.3, 1.1),
        alpha: r.range(0.15, 0.7),
      });
    }
  }

  /** Midpoint-displacement fractal ridge, normalized to 0..1 so peaks always read. */
  _ridgeLine(size, roughness, detail) {
    const points = new Array(size + 1).fill(0);
    points[0] = this.rng.range(0.1, 0.5);
    points[size] = this.rng.range(0.1, 0.5);
    let displace = detail;
    for (let step = size; step > 1; step >>= 1) {
      const half = step >> 1;
      for (let i = half; i < size; i += step) {
        const avg = (points[i - half] + points[i + half]) / 2;
        points[i] = avg + (this.rng.next() - 0.5) * displace;
      }
      displace *= roughness;
    }
    let min = Infinity;
    let max = -Infinity;
    for (const v of points) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
    const span = max - min || 1;
    for (let i = 0; i <= size; i++) points[i] = (points[i] - min) / span;
    return points;
  }

  _buildMountains() {
    const cfg = this.config.mountains;
    this.mountainLayers = [];
    const segments = Math.max(128, cfg.hillsCount * 24);
    const size = 1 << Math.ceil(Math.log2(segments));
    cfg.layers.forEach((layer, idx) => {
      const norm = this._ridgeLine(size, layer.roughness, layer.detail ?? 1);
      const peakH = this.height * layer.heightRatio;
      const points = norm.map((v) => v * peakH);
      const baseY = this.horizonY + idx * this.height * cfg.layerDropRatio;
      this.mountainLayers.push({ points, peakH, baseY, layer, size });
    });
  }

  update(dt) {
    this.time += dt;
  }

  draw(ctx) {
    const { width, height, horizonY } = this;

    // Sky
    ctx.fillStyle = this._skyGradient;
    ctx.fillRect(0, 0, width, horizonY + 2);

    // Ambient glow near horizon
    const glow = ctx.createRadialGradient(
      width * 0.5, horizonY, 0,
      width * 0.5, horizonY, width * 0.6
    );
    glow.addColorStop(0, this.config.world.ambientGlowColor);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, horizonY + 2);

    // Milky way
    for (const p of this.milky) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = this.config.milkyWay.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Stars with twinkle
    const s = this.config.stars;
    for (const star of this.stars) {
      const tw = Math.sin(this.time * star.speed + star.phase) * 0.5 + 0.5;
      const alpha = Math.min(1, s.baseAlpha + tw * s.twinkleAlpha);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = star.color;
      if (star.bright) {
        ctx.shadowBlur = s.brightStarGlow;
        ctx.shadowColor = star.color;
      }
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;

    // Mountains (front to back drawn back-first)
    for (const m of this.mountainLayers) {
      this._drawMountainLayer(ctx, m);
    }

    // Vignette
    this._drawVignette(ctx);
  }

  _drawMountainLayer(ctx, m) {
    const { points, baseY, layer, size } = m;
    ctx.beginPath();
    ctx.moveTo(0, this.height);
    for (let i = 0; i <= size; i++) {
      const x = (i / size) * this.width;
      const y = baseY - points[i];
      ctx.lineTo(x, y);
    }
    ctx.lineTo(this.width, this.height);
    ctx.closePath();
    ctx.fillStyle = layer.color;
    ctx.fill();

    // Faint starlight rim along the ridge
    if (this.config.mountains.ridgeLightColor) {
      ctx.beginPath();
      for (let i = 0; i <= size; i++) {
        const x = (i / size) * this.width;
        const y = baseY - points[i];
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = this.config.mountains.ridgeLightColor;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    // Snow caps on the tallest peaks of the farthest (tallest) layer
    if (this.config.mountains.snowLine != null && layer === this.config.mountains.layers[0]) {
      const snowY = baseY - m.peakH * this.config.mountains.snowLine;
      ctx.save();
      // Clip to the mountain body, then paint snow only above the snow line.
      ctx.beginPath();
      ctx.moveTo(0, this.height);
      for (let i = 0; i <= size; i++) {
        const x = (i / size) * this.width;
        const y = baseY - points[i];
        ctx.lineTo(x, y);
      }
      ctx.lineTo(this.width, this.height);
      ctx.closePath();
      ctx.clip();
      const grad = ctx.createLinearGradient(0, snowY - m.peakH * 0.25, 0, snowY);
      grad.addColorStop(0, this.config.mountains.snowColor);
      grad.addColorStop(1, "rgba(220, 230, 255, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.width, snowY);
      ctx.restore();
    }
  }

  _drawVignette(ctx) {
    const v = this.config.world.vignette;
    if (!v) return;
    const g = ctx.createRadialGradient(
      this.width * 0.5, this.height * 0.45, this.height * 0.2,
      this.width * 0.5, this.height * 0.5, this.height * 0.85
    );
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, `rgba(0,0,0,${v})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.width, this.height);
  }
}
