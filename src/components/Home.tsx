import { Link } from "react-router-dom";
import GreyBox from "./ui/GreyBox";
import H1 from "./ui/H1";

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

const Home = () => {
  return (
    <div>
      <H1>Welcome to Fractal?</H1>
      <GreyBox title="Where would you like to start?">
        <div className="grid grid-cols-2 gap-2">
          <BlackButton to="/daos/new">Create a new Fractal</BlackButton>
          <BlackButton to="/daos">Find an existing Fractal</BlackButton>
        </div>
      </GreyBox>
    </div>
  );
}


export default Home;