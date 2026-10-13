const destinations = new Set(['/account/library', '/community', '/admin', '/account/update-password']);
export function authDestination(value: string | null | undefined) {
  return value && destinations.has(value) ? value : '/account/library';
}
