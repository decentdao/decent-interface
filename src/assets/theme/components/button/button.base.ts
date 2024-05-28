// Global Base button
import { defineStyle } from '@chakra-ui/react'

const baseStyle = defineStyle({
  alignItems: 'center',
  borderRadius: '4px',
  boxShadow: 'none',
  display: 'flex',
  justifyContent: 'center',
  gap: '4px',
  _disabled: {
    cursor: 'default'
  },
  _hover: {},
  _focus: {}
})

export default baseStyle