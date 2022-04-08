import React from "react";

function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-center pb-4 text-xl">
      {children}
    </h1>
  )
}

export default H1;
