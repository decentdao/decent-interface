import { Link } from "react-router-dom";
import GreyBox from "./ui/GreyBox";
import H1 from "./ui/H1";

const ColoredButton = ({
  to,
  color,
  textColor,
  children,
}: {
  to: string,
  color: string,
  textColor: string,
  children: React.ReactNode,
}) => {
  return (
    <div className={`bg-${color} border border-gold rounded-lg md:my-0 mb-4 md:w-full w-96`}>
      <Link to={to}>
        <p className={`text-${textColor} text-center py-4 px-2`}>
          {children}
        </p>
      </Link>
    </div>
  )
}

const Home = () => {
  return (
    <div>
      <H1>Welcome to Fractal</H1>
      <GreyBox title="What path will you take?">
        <div className="md:grid md:grid-cols-2 md:gap-6 flex flex-col items-center">
          <ColoredButton to="/daos/new" color="gold" textColor="black">Create a Fractal</ColoredButton>
          <ColoredButton to="/daos" color="chocolate" textColor="gold">Find a Fractal</ColoredButton>
        </div>
      </GreyBox>
    </div>
  );
}


export default Home;