/** Cached soft radial-glow sprites so we never pay per-particle shadowBlur cost. */
const cache = new Map();

function makeSprite(color, size) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const r = size / 2;
  const g = ctx.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0, color);
  g.addColorStop(0.22, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.fill();
  return c;
}

export const glow = {
  get(color, size = 64) {
    const key = color + "@" + size;
    let sprite = cache.get(key);
    if (!sprite) {
      sprite = makeSprite(color, size);
      cache.set(key, sprite);
    }
    return sprite;
  },
};
