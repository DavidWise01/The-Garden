// /kernel/pulse/detector.ts

export function isDescendingDensity(bits: number[]): boolean {
  if (bits.length !== 12) return false;

  const segments = [
    bits.slice(0, 3),   // 111
    bits.slice(3, 6),   // 110
    bits.slice(6, 9),   // 100
    bits.slice(9, 12)   // 000
  ];

  const densities = segments.map(seg => seg.reduce((a, b) => a + b, 0));

  return (
    densities[0] === 3 &&
    densities[1] === 2 &&
    densities[2] === 1 &&
    densities[3] === 0
  );
}
