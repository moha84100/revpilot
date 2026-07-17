export const wordCount = (text) => text.trim().split(/\s+/u).filter(Boolean).length

export function validateTimeline(timeline) {
  const errors = []
  const scenes = timeline?.scenes ?? []
  const allowed = new Set(timeline?.allowedKeywords ?? [])
  const totalDuration = scenes.reduce((sum, scene) => sum + Number(scene.duration || 0), 0)
  const totalWords = scenes.reduce((sum, scene) => sum + wordCount(scene.narration || ''), 0)
  const characters = scenes.filter((scene) => scene.character)
  const contextVideos = scenes.filter((scene) => scene.source === 'hotel-broll' || scene.cutaway)

  if (scenes.length !== 7) errors.push('La timeline doit contenir exactement 7 scènes.')
  if (totalDuration < 60 || totalDuration > 75) errors.push('La durée totale doit rester entre 60 et 75 secondes.')
  if (totalWords < 160 || totalWords > 175) errors.push('La narration doit contenir entre 160 et 175 mots.')
  if (characters.length > 4) errors.push('Le copilote apparaît plus de quatre fois.')
  if (characters.some((scene) => scene.character.duration > 3)) errors.push('Une apparition du copilote dépasse trois secondes.')
  if (contextVideos.length !== 4) errors.push('Le montage doit contenir exactement quatre vidéos de contexte.')
  if (scenes.flatMap((scene) => scene.zooms ?? []).some((zoom) => zoom.scale > 1.35)) errors.push('Un zoom dépasse 135 %.')
  if ((scenes.find((scene) => scene.id === 'cta')?.duration ?? 0) < 5) errors.push('Le CTA doit durer au moins cinq secondes.')
  for (const scene of scenes) {
    if (scene.duration < scene.durationRange[0] || scene.duration > scene.durationRange[1]) errors.push(`Durée hors plage pour ${scene.id}.`)
    if (scene.cutaway && (scene.cutaway.duration < 2 || scene.cutaway.duration > 4)) errors.push(`Plan de coupe hors plage pour ${scene.id}.`)
    if (scene.cutaway && (scene.cutaway.fade < 0.25 || scene.cutaway.fade > 0.4)) errors.push(`Fondu hors plage pour ${scene.id}.`)
    for (const keyword of scene.keywords ?? []) if (!allowed.has(keyword)) errors.push(`Mot-clé non autorisé : ${keyword}.`)
  }
  return { errors, totalDuration, totalWords }
}
