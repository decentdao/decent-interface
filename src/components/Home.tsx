import GreyBox from "./ui/GreyBox";
import H1 from "./ui/H1";
import BlackButton from "./ui/BlackButton";

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