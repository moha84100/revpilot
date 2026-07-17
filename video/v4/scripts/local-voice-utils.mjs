export function requiredTempo(sourceDuration, targetDuration) {
  if (sourceDuration <= 0 || targetDuration <= 0) throw new Error('Les durées audio doivent être positives.')
  return Math.max(1, Number((sourceDuration / targetDuration).toFixed(4)))
}

export function tempoFilter(tempo) {
  if (tempo < 0.5 || tempo > 2) throw new Error('Le recalage vocal demandé est trop important.')
  return `atempo=${tempo}`
}
