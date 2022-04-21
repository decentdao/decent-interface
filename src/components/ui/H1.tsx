import React from "react";

function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-4xl tracking-wider text-black-100">
      {children}
    </h1>
  )
}

export default H1;
