import { ReactNode } from "react";

const InputBox = ({ children }: { children: ReactNode }) => {
  return (
    <div className="bg-gray-500 rounded-lg my-4">
      <div className="px-4 py-4">{children}</div>
    </div>
  );
};

export default InputBox;
