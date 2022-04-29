import { ReactNode } from 'react'

const InputBox = (
  {
    label,
    isContentCenter,
    children
  }: {
    label?: string,
    isContentCenter?: boolean;
    children: ReactNode
  }) => {

  const centerContent = isContentCenter ? "" : ""
  return (
    <div className="bg-gray-500 rounded-lg my-4">
      <div className={`px-4 py-4 ${centerContent}`}>
        {children}
      </div>
    </div>
  )
}

export default InputBox