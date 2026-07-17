export function detectedDurations(output, kind) {
  const pattern = kind === 'silence' ? /silence_duration:\s*([\d.]+)/g : /black_duration:([\d.]+)/g
  return [...output.matchAll(pattern)].map((match) => Number(match[1]))
}

export function transitionQuality(silenceOutput, blackOutput) {
  const silences = detectedDurations(silenceOutput, 'silence').filter((duration) => duration >= 1)
  const blackFrames = detectedDurations(blackOutput, 'black').filter((duration) => duration >= 0.15)
  return { silences, blackFrames }
}
