import { ReactNode } from 'react'

const DetailsLabel = ({
    children
}:{
    children: ReactNode
}) => {
  return (
    <div className="text-lg text-mediumGray">{children}</div>
  )
}

export default DetailsLabel