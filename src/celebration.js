/** A brief glowing, auto-fitting congratulatory banner shown after a hit. */
export class Celebration {
  constructor(config) {
    this.config = config.celebration;
    this.width = 0;
    this.height = 0;
    this.active = false;
    this.elapsed = 0;
    this.fontSize = this.config.baseFontSize;
  }

  setText(text) {
    if (text) this.config = { ...this.config, text };
  }

  resize(width, height, ctx) {
    this.width = width;
    this.height = height;
    this._fit(ctx);
  }

  _fit(ctx) {
    const c = this.config;
    const maxWidth = this.width * c.maxWidthRatio;
    let size = Math.min(c.baseFontSize, this.width * 0.12);
    ctx.save();
    ctx.font = `${c.fontWeight} ${size}px ${c.fontFamily}`;
    let measured = ctx.measureText(c.text).width + (c.text.length - 1) * c.letterSpacing;
    if (measured > maxWidth) size = Math.max(c.minFontSize, (size * maxWidth) / measured);
    ctx.restore();
    this.fontSize = size;
  }

  trigger(ctx) {
    if (!this.config.enabled) return;
    this._fit(ctx);
    this.active = true;
    this.elapsed = 0;
  }

  get _totalMs() {
    const c = this.config;
    return c.delayMs + c.fadeInMs + c.holdMs + c.fadeOutMs;
  }

  update(dt) {
    if (!this.active) return;
    this.elapsed += dt * 1000;
    if (this.elapsed >= this._totalMs) this.active = false;
  }

  _alpha() {
    const c = this.config;
    const t = this.elapsed;
    if (t < c.delayMs) return 0;
    const rel = t - c.delayMs;
    if (rel < c.fadeInMs) return rel / c.fadeInMs;
    if (rel < c.fadeInMs + c.holdMs) return 1;
    const out = rel - c.fadeInMs - c.holdMs;
    return Math.max(0, 1 - out / c.fadeOutMs);
  }

  draw(ctx, time) {
    if (!this.active) return;
    const alpha = this._alpha();
    if (alpha <= 0) return;
    const c = this.config;

    const progress = Math.min(1, this.elapsed / this._totalMs);
    const x = this.width * 0.5;
    const y = this.height * c.yRatio - c.floatUp * progress;
    const pulse = 1 + 0.03 * Math.sin(time * 6);

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${c.fontWeight} ${this.fontSize * pulse}px ${c.fontFamily}`;
    ctx.globalAlpha = alpha;

    // Glow
    ctx.fillStyle = c.color;
    ctx.shadowColor = c.glowColor;
    ctx.shadowBlur = 32;
    this._drawSpacedText(ctx, c.text, x, y, c.letterSpacing);
    ctx.shadowBlur = 18;
    this._drawSpacedText(ctx, c.text, x, y, c.letterSpacing);

    // Core fill
    ctx.shadowBlur = 0;
    ctx.fillStyle = c.color;
    this._drawSpacedText(ctx, c.text, x, y, c.letterSpacing);
    ctx.restore();
  }

  _drawSpacedText(ctx, text, cx, cy, spacing) {
    if (!spacing) {
      ctx.fillText(text, cx, cy);
      return;
    }
    const widths = [...text].map((ch) => ctx.measureText(ch).width);
    const total = widths.reduce((a, b) => a + b, 0) + (text.length - 1) * spacing;
    let x = cx - total / 2;
    ctx.save();
    ctx.textAlign = "left";
    [...text].forEach((ch, i) => {
      ctx.fillText(ch, x, cy);
      x += widths[i] + spacing;
    });
    ctx.restore();
  }
}
