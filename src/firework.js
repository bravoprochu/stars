import { glow } from "./glow.js";

/** A firework burst spawned where a shooting star was hit. */
export class Firework {
  constructor(config, x, y, rng) {
    this.config = config.firework;
    this.x = x;
    this.y = y;
    this.particles = [];
    this.flash = 1;
    this.done = false;
    this._burst(rng);
  }

  _burst(rng) {
    const c = this.config;
    const palette = rng.pick(c.palettes);
    const total = c.particleCount + c.extraRingCount;
    for (let i = 0; i < total; i++) {
      const angle = rng.range(0, Math.PI * 2);
      // Ring particles get a tighter, faster shell.
      const isRing = i >= c.particleCount;
      const speed = isRing
        ? rng.range(c.maxSpeed * 0.7, c.maxSpeed)
        : rng.range(c.minSpeed, c.maxSpeed);
      const life = c.lifespanMs + rng.range(0, c.lifespanJitterMs);
      this.particles.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        color: rng.pick(palette),
        radius: c.startRadius * rng.range(0.6, 1.2),
        sparkle: rng.chance(c.sparkleChance),
        sparklePhase: rng.range(0, Math.PI * 2),
      });
    }
  }

  update(dt) {
    const c = this.config;
    this.flash = Math.max(0, this.flash - dt * 6);
    const dragPerFrame = Math.pow(c.drag, dt * 60);
    let anyAlive = false;
    for (const p of this.particles) {
      if (p.life <= 0) continue;
      p.life -= dt * 1000;
      p.vy += c.gravity * dt;
      p.vx *= dragPerFrame;
      p.vy *= dragPerFrame;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life > 0) anyAlive = true;
    }
    if (!anyAlive && this.flash <= 0) this.done = true;
  }

  draw(ctx, time) {
    const c = this.config;

    // Central flash
    if (this.flash > 0) {
      const r = c.flashRadius * this.flash;
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r);
      g.addColorStop(0, `rgba(255,255,255,${0.7 * this.flash})`);
      g.addColorStop(0.4, `rgba(255,240,200,${0.28 * this.flash})`);
      g.addColorStop(1, "rgba(255,240,200,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = "lighter";
    for (const p of this.particles) {
      if (p.life <= 0) continue;
      let alpha = Math.min(1, p.life / p.maxLife);
      if (p.sparkle) {
        alpha *= 0.5 + 0.5 * Math.sin(time * 18 + p.sparklePhase);
      }
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.radius * (0.5 + 0.6 * alpha);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 0.02, p.y - p.vy * 0.02);
      ctx.stroke();

      // Cheap glow via a cached sprite instead of per-particle shadowBlur.
      const sprite = glow.get(p.color);
      const s = p.radius * 7 * (0.55 + 0.45 * alpha);
      ctx.drawImage(sprite, p.x - s / 2, p.y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
}
