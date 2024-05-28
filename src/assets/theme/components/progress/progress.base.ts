import { progressAnatomy } from "@chakra-ui/anatomy"
import { createMultiStyleConfigHelpers } from "@chakra-ui/react"

const { definePartsStyle } = createMultiStyleConfigHelpers(progressAnatomy.keys)

const baseStyles = definePartsStyle({
  track: {
    bg: "neutral-2",
    borderRadius: "4px",
  },
  filledTrack: {
    bg: "lilac--3",
    borderRadius: "4px",
  },
  label: {

  },
})

export default baseStyles
