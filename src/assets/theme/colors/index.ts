import colorTokens from "./color.styles.tokens.json"

interface ColorValue {
  $value?: string
}

interface ColorToken {
  [key: string]: ColorValue | ColorToken
}

const extractColorsFromJson = (tokens: ColorToken, prefix = ""): Record<string, string> => {
  const colors: Record<string, string> = {}
  Object.entries(tokens).forEach(([key, value]) => {
    // Replace spaces with dashes in the key
    const formattedKey = key.replace(/\s+/g, "-").toLowerCase()
    if (typeof value === "object" && value !== null) {
      if ("$value" in value && typeof value.$value === "string") {
        colors[`${prefix}${formattedKey}`] = value.$value
      } else {
        const nestedColors = extractColorsFromJson(value as ColorToken, `${prefix}${formattedKey}-`)
        Object.assign(colors, nestedColors)
      }
    }
  })

  return colors
}

const colors = extractColorsFromJson(colorTokens as unknown as ColorToken)

export type Colors = typeof colors
export default colors
