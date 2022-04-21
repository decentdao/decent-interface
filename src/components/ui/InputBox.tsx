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
    <div className="bg-gray-500 rounded-lg my-4">
      <div className="px-4 py-4">
        <div className="text-sm text-gray-50 pb-2">{label}</div>
        {children}
      </div>
    </div>
  )
}

export default InputBox