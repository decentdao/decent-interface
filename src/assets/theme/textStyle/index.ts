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
  value: TypographyValue;
}

interface TypographyTokenGroup {
  [key: string]: TypographyToken;
}

interface TypographyScheme {
  [groupName: string]: TypographyTokenGroup;
}

const extractTypographyFromJson = (tokens: TypographyScheme) => {
  const typography: Record<string, TypographyValue> = {};

  Object.entries(tokens).forEach(([groupKey, groupValue]) => {
    Object.entries(groupValue).forEach(([styleKey, styleValue]) => {
      const formattedKey = `${groupKey}-${styleKey}`.replace(/\s+/g, '-').toLowerCase();
      if (styleValue && typeof styleValue.value === 'object' && styleValue.value) {
        typography[formattedKey] = {
          ...styleValue.value,
          fontSize: `${styleValue.value.fontSize}px`,
          letterSpacing: `${styleValue.value.letterSpacing}px`,
          lineHeight: `${styleValue.value.lineHeight}px`,
        };
      }
    });
  });

  return typography;
};

const typography = extractTypographyFromJson(textStylesTokens as unknown as TypographyScheme);

export type Typography = typeof typography;
export default typography;
