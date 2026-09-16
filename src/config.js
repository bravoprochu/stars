/**
 * Scene configuration model.
 * Structure is plain-JSON compatible: every value is a primitive, array or
 * nested object, so this file can be replaced by a `config.json` fetch later
 * without changing the engine.
 */
export const config = {
  world: {
    seed: 1337,
    backgroundStops: [
      { at: 0.0, color: "#05060f" },
      { at: 0.45, color: "#0a1030" },
      { at: 0.75, color: "#15224f" },
      { at: 1.0, color: "#243a6b" },
    ],
    horizonRatio: 0.78,
    ambientGlowColor: "rgba(80, 120, 220, 0.10)",
    vignette: 0.55,
  },

  stars: {
    initStars: 260,
    minRadius: 0.4,
    maxRadius: 1.7,
    minTwinkleSpeed: 0.4,
    maxTwinkleSpeed: 2.2,
    baseAlpha: 0.45,
    twinkleAlpha: 0.55,
    palette: ["#ffffff", "#cfe0ff", "#fff2cc", "#ffd9d0", "#d6ccff"],
    brightStarChance: 0.08,
    brightStarGlow: 6,
  },

  milkyWay: {
    enabled: true,
    bandCount: 3,
    starCount: 420,
    color: "rgba(200, 210, 255, 0.55)",
    tilt: -0.32,
    thickness: 0.16,
  },

  mountains: {
    hillsCount: 9,
    layers: [
      { heightRatio: 0.2, roughness: 0.64, color: "#111a40", detail: 0.9 },
      { heightRatio: 0.15, roughness: 0.6, color: "#0a1130", detail: 1.0 },
      { heightRatio: 0.1, roughness: 0.56, color: "#04060f", detail: 1.15 },
    ],
    layerDropRatio: 0.045,
    snowLine: 0.72,
    snowColor: "rgba(216, 226, 255, 0.62)",
    ridgeLightColor: "rgba(150, 175, 255, 0.10)",
  },

  shootingStar: {
    firstStarMaxRandomShowMs: 2600,
    minDelayMs: 2200,
    maxDelayMs: 6000,
    minSpeed: 190,
    maxSpeed: 340,
    trailLength: 28,
    coreRadius: 2.6,
    glowRadius: 22,
    color: "#ffffff",
    tailColor: "rgba(160, 200, 255, 0.9)",
    hitRadius: 34,
    minAngleDeg: 18,
    maxAngleDeg: 42,
    spawnMarginRatio: 0.12,
  },

  firework: {
    particleCount: 120,
    extraRingCount: 48,
    minSpeed: 120,
    maxSpeed: 460,
    gravity: 120,
    drag: 0.9,
    lifespanMs: 1700,
    lifespanJitterMs: 800,
    startRadius: 3.2,
    trailFade: 0.86,
    flashRadius: 70,
    palettes: [
      ["#ff5252", "#ffb142", "#fffa65", "#ff9ff3"],
      ["#48dbfb", "#0abde3", "#54a0ff", "#c8d6ff"],
      ["#1dd1a1", "#10ac84", "#a8ff78", "#feff9c"],
      ["#f368e0", "#ff9ff3", "#ff6b81", "#ffd1e0"],
      ["#feca57", "#ff9f43", "#ee5253", "#fff200"],
    ],
    sparkleChance: 0.4,
  },

  interaction: {
    cursorHint: true,
    scoreEnabled: true,
  },

  celebration: {
    enabled: true,
    text: "Bravo",
    color: "#fff6d8",
    glowColor: "rgba(255, 214, 140, 0.95)",
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    fontWeight: 700,
    baseFontSize: 92,
    minFontSize: 22,
    maxWidthRatio: 0.82,
    yRatio: 0.4,
    delayMs: 220,
    fadeInMs: 320,
    holdMs: 1000,
    fadeOutMs: 720,
    floatUp: 26,
    letterSpacing: 2,
  },
};
