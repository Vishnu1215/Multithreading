// Simple Mulberry32 seeded Pseudo-Random Number Generator
export function createRNG(seed: number) {
  let s = seed;
  return function next(): number {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededNoise(rng: () => number, minPercent: number = -0.03, maxPercent: number = 0.03): number {
  return 1 + (minPercent + rng() * (maxPercent - minPercent));
}
