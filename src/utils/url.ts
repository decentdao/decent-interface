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
 *
 * Note that ENS names can use DNS TLDs, so they do not necessarily
 * end in '.eth', though that is the most common.
 */
export const couldBeENS = (ensAddress?: string): boolean => {
  if (!ensAddress) return false;

  // everything up to the last index included, to support subdomains, e.g. blah.decent-dao.eth
  const name = ensAddress.substring(0, ensAddress.lastIndexOf('.')).trim();
  const tld = ensAddress.substring(ensAddress.lastIndexOf('.') + 1).trim();

  // checks codepoints, not string length, as emojis would count as two
  // characters with a regular string.length check.
  const validName = [...name].length >= 3;

  // check that domain length is at least 2 characters and alpha numeric and dashes only
  const validDomain = [...tld].length >= 2 && /^[-A-Za-z0-9]*$/.test(tld);

  return validName && validDomain;
};
