export function getFirstError(field: { state: { meta: { errors: unknown[] } } }) {
  const first = field.state.meta.errors[0];

  if (!first) return undefined;
  if (typeof first === 'string') return first;
  if (typeof first === 'object' && 'message' in first && typeof first.message === 'string') {
    return first.message;
  }

  return 'Input tidak valid';
}
