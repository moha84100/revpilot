export function escapeFilterPath(path) {
  return path.replaceAll('\\', '/').replaceAll(':', '\\:').replaceAll("'", "'\\''")
}

export function zoomFilter(scene, boxes, fps = 30) {
  const zoom = scene.zooms?.at(-1)
  if (!zoom || !boxes?.[zoom.target]) return `fps=${fps},scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080`
  const box = boxes[zoom.target]
  const centerX = Math.round(box.x + box.width / 2)
  const centerY = Math.round(box.y + box.height / 2)
  const start = Math.round(zoom.at * fps)
  const end = Math.round(Math.min(scene.duration, zoom.at + zoom.duration) * fps)
  const ramp = Math.min(18, Math.max(8, Math.round((end - start) / 4)))
  const delta = Number((zoom.scale - 1).toFixed(3))
  const peak = `if(lt(on,${start}),0,if(lt(on,${start + ramp}),(on-${start})/${ramp},if(lt(on,${end - ramp}),1,if(lt(on,${end}),(${end}-on)/${ramp},0))))`
  const z = `1+${delta}*(${peak})`
  return `fps=${fps},zoompan=z='${z}':x='max(0,min(iw-iw/zoom,${centerX}-iw/zoom/2))':y='max(0,min(ih-ih/zoom,${centerY}-ih/zoom/2))':d=1:s=1920x1080:fps=${fps}`
}
