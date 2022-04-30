import React from "react";

function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-2xl tracking-wider text-gray-25 mb-4 font-mono">
      {children}
    </h1>
  )
}

export default H1;
