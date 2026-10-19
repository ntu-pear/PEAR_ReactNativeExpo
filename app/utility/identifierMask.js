// Mask on display independently of Social History privacy levels.
export const maskIdentifier = (value) => {
  const text = String(value ?? '').trim();
  if (!text || text === '-') {
    return text;
  }
  const visible = text.length > 4 ? text.slice(-4) : '';
  return '*'.repeat(text.length - visible.length) + visible;
};
