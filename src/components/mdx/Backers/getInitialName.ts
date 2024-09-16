export function getInitialName(name: string): string {
  const splitName = name.split(' ')
  if (splitName.length > 1) {
    return (splitName[0][0] + splitName[1][0]).toUpperCase()
  }
  return splitName[0].slice(0, 2).toUpperCase()
}
