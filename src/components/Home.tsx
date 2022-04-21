import { Link } from "react-router-dom";
import ContentBox from "./ui/ContentBox";
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
    <div className={`border border-gold-500 ${color} rounded-lg md:my-0 mb-4 md:w-full w-96`}>
      <Link to={to}>
        <p className={`${textColor} text-center py-4 px-2`}>
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
      <ContentBox title="What path will you take?">
        <div className="md:grid md:grid-cols-2 md:gap-6 flex flex-col items-center py-4">
          <ColoredButton to="/daos/new" color='bg-gold-500' textColor="text-gray-900">Create a Fractal</ColoredButton>
          <ColoredButton to="/daos" color="bg-chocolate" textColor="text-gray-500">Find a Fractal</ColoredButton>
        </div>
      </ContentBox>
    </div>
  );
}


export default Home;