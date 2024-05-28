import { cssVar } from "@chakra-ui/theme-tools"

const $arrowBg = cssVar("popper-arrow-bg")

export default {
  baseStyle: {
    borderRadius: '4px',
    backgroundColor: 'black-0',
    padding: '0.25rem 0.5rem',
    color: 'white-0',
    [$arrowBg.variable]: 'black-0'
  }
}