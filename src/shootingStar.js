/** A single shooting star that arcs across the sky toward the horizon. */
export class ShootingStar {
  constructor(config, width, height, horizonY, rng) {
    this.config = config.shootingStar;
    this.width = width;
    this.height = height;
    this.horizonY = horizonY;
    this.trail = [];
    this.alive = true;
    this.escaped = false;
    this._spawn(rng);
  }

  _spawn(rng) {
    const c = this.config;
    const fromLeft = rng.chance(0.5);
    const margin = this.width * c.spawnMarginRatio;
    const angle = (rng.range(c.minAngleDeg, c.maxAngleDeg) * Math.PI) / 180;
    const speed = rng.range(c.minSpeed, c.maxSpeed);

    if (fromLeft) {
      this.x = rng.range(-margin, this.width * 0.35);
      this.vx = Math.cos(angle) * speed;
    } else {
      this.x = rng.range(this.width * 0.65, this.width + margin);
      this.vx = -Math.cos(angle) * speed;
    }
    this.y = rng.range(-margin * 0.4, this.horizonY * 0.35);
    this.vy = Math.sin(angle) * speed;
    this.color = c.color;
  }

  get head() {
    return { x: this.x, y: this.y };
  }

  hitTest(mx, my) {
    const dx = mx - this.x;
    const dy = my - this.y;
    return dx * dx + dy * dy <= this.config.hitRadius * this.config.hitRadius;
  }

  update(dt) {
    if (!this.alive) return;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.config.trailLength) this.trail.shift();

    const offX = this.x < -80 || this.x > this.width + 80;
    if (this.y >= this.horizonY || offX) {
      this.alive = false;
      this.escaped = true;
    }
  }

  draw(ctx) {
    if (!this.alive || this.trail.length < 2) return;
    const c = this.config;

    // Trail
    for (let i = 1; i < this.trail.length; i++) {
      const p0 = this.trail[i - 1];
      const p1 = this.trail[i];
      const t = i / this.trail.length;
      ctx.strokeStyle = c.tailColor;
      ctx.globalAlpha = t * 0.9;
      ctx.lineWidth = t * c.coreRadius * 1.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Glow + core head
    const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, c.glowRadius);
    glow.addColorStop(0, "rgba(255,255,255,0.95)");
    glow.addColorStop(0.4, "rgba(180,210,255,0.35)");
    glow.addColorStop(1, "rgba(180,210,255,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(this.x, this.y, c.glowRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, c.coreRadius, 0, Math.PI * 2);
    ctx.fill();
  }
}
