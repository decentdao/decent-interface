import textStylesTokens from './text.styles.tokens.json';

export interface TypographyValue {
  fontFamily: string;
  fontSize: string;
  fontWeight: number | string;
  letterSpacing: string;
  lineHeight: string;
  textTransform: string;
  textDecoration: string;
}

interface TypographyToken {
  $type: string;
  $value: TypographyValue;
}

interface TypographyTokenGroup {
  [key: string]: TypographyToken;
}

interface TypographyScheme {
  [groupName: string]: TypographyTokenGroup;
}

const extractTypographyFromJson = (tokens: TypographyScheme, prefix = '') => {
  const typography: Record<string, TypographyValue> = {};
  Object.entries(tokens).forEach(([key, value]) => {
    Object.entries(value).forEach(([innerKey, innerValue]) => {
      const formattedInnerKey = innerKey.replace(/\s+/g, '-').toLowerCase();
      if (innerValue && typeof innerValue === 'object' && innerValue.$value) {
        typography[`${formattedInnerKey}`] = innerValue.$value;
      }
    });
  });

  return typography;
};

const typography = extractTypographyFromJson(textStylesTokens as unknown as TypographyScheme);

export type Typography = typeof typography;
export default typography;
