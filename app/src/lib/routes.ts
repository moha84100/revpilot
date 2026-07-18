export type Experience = 'marketing' | 'dashboard'

export function resolveExperience(pathname: string): Experience {
  const segments = pathname.split('/').filter(Boolean)
  return segments.at(-1) === 'app' ? 'dashboard' : 'marketing'
}
