import { numberInputAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import baseStyle from './numberInput.base'
import sizes from './numberInput.sizes'

const { defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(numberInputAnatomy.keys)

const NumberInput = defineMultiStyleConfig({
  baseStyle,
  sizes,
  defaultProps: {
    size: 'base',
  },
})


export default NumberInput