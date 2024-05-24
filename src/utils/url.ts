import { normalize } from 'viem/ens';

export const isValidUrl = (urlString: string) => {
  try {
    const url = new URL(urlString);
    return !!url;
  } catch (e) {
    return false;
  }
};

/**
 * Tests whether the given string *could* be an ENS address.
 * Useful for preventing unnecessary resolver calls for strings that
 * aren't valid ENS names anyway.
 */
export const validateENSName = (ensAddress?: string): boolean => {
  if (!ensAddress) return false;

  const name = ensAddress.substring(0, ensAddress.lastIndexOf('.')).trim();
  const isValidLength = [...name].length >= 3;
  if (!isValidLength) return false;

  try {
    normalize(ensAddress);
    return true;
  } catch (e) {
    return false;
  }
};
