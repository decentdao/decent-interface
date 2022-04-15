import { ReactNode } from 'react'

const DetailsLabel = ({
    children
}:{
    children: ReactNode
}) => {
  return (
    <div className="pb-8 text-lg text-mediumGray">{children}</div>
  )
}

export default DetailsLabel