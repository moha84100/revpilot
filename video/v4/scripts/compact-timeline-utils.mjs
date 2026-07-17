const round = (value) => Math.round(value * 100) / 100

const scaleTimedItem = (item, factor) => ({
  ...item,
  ...(typeof item.at === 'number' ? { at: round(item.at * factor) } : {}),
  ...(typeof item.duration === 'number' ? { duration: round(item.duration * factor) } : {}),
})

export function compactTimeline(timeline, audioDurations, breathingRoom = 0.2, audioTempo = 0.94) {
  const durationById = new Map(audioDurations.map((audio) => [audio.id, audio.duration]))
  const scenes = timeline.scenes.map((scene) => {
    const audioDuration = durationById.get(scene.id)
    if (!audioDuration) throw new Error(`Durée audio absente pour ${scene.id}.`)
    const duration = round(audioDuration / audioTempo + breathingRoom)
    const factor = duration / scene.duration
    return {
      ...scene,
      duration,
      durationRange: [round(duration - 0.15), round(duration + 0.15)],
      actions: (scene.actions ?? []).map((action) => scaleTimedItem(action, factor)),
      zooms: (scene.zooms ?? []).map((zoom) => scaleTimedItem(zoom, factor)),
      character: scene.character ? scaleTimedItem(scene.character, factor) : null,
      cutaway: scene.cutaway ? {
        ...scene.cutaway,
        duration: round(scene.cutaway.duration * factor),
      } : undefined,
    }
  })
  const duration = round(scenes.reduce((sum, scene) => sum + scene.duration, 0))
  if (duration < 59 || duration > 61) throw new Error(`La timeline compacte dure ${duration} s au lieu de 59 à 61 s.`)
  return { ...timeline, version: `${timeline.version}-compact`, scenes }
}
