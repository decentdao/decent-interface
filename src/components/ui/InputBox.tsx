import { ReactNode } from 'react'

const InputBox = (
  {
    label,
    children
  }: {
    label: string,
    children: ReactNode
  }) => {
  return (
    <div className="bg-black-300 rounded-lg my-4">
      <div className="px-4 py-4">
        <div className="text-sm text-mediumGray pb-2">{label}</div>
        {children}
      </div>
    </div>
  )
}

export default InputBox