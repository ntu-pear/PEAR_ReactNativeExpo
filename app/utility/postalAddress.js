// A postal suffix must be a complete token, never the tail of a longer number.
export const splitPostalAddress = (value, explicitPostalCode) => {
  const address = String(value ?? '').trim();
  const postalCode = String(explicitPostalCode ?? '').trim();
  if (postalCode || !address) {
    return { address, postalCode };
  }

  const suffix = /(?:^|[\s,]+)(?:S\s*\(?\s*)?(\d{6})\)?\s*$/i;
  const match = address.match(suffix);
  if (!match) {
    return { address, postalCode: '' };
  }
  return {
    address: address.slice(0, match.index).trim(),
    postalCode: match[1],
  };
};
