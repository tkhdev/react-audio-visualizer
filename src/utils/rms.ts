/**
 * Calculate Root Mean Square (RMS) from time-domain data
 */
export function calculateRMS(data: ArrayLike<number>): number {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    const normalized = (data[i] - 128) / 128;
    sum += normalized * normalized;
  }
  return Math.sqrt(sum / data.length);
}

