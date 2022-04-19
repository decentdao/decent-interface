import { Link } from "react-router-dom";

const BlackButton = ({
  to,
  children,
}: {
  to: string,
  children: React.ReactNode,
}) => {
  return (
    <div className="bg-black">
      <Link to={to}>
        <div className="h-full flex flex-col justify-center">
          <p className="text-white text-center py-8 px-2">{children}</p>
        </div>
      </Link>
    </div>
  )
}

export default BlackButton;