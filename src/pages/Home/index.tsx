import { Link } from 'react-router-dom';
import ContentBox from '../../components/ui/ContentBox';
import { PrimaryButton, SecondaryButton } from '../../components/ui/forms/Button';
import H1 from '../../components/ui/H1';

function Home() {
  return (
    <div>
      <H1>Welcome to Fractal</H1>
      <ContentBox title="What path will you take?">
        <div className="md:grid md:grid-cols-2 gap-6 flex flex-col items-center py-4">
          <Link
            to="/daos/new"
            className="w-full"
          >
            <PrimaryButton
              label="Create a Fractal"
              isLarge
              className="w-full"
            />
          </Link>
          <Link
            to="/daos"
            className="w-full"
          >
            <SecondaryButton
              label="Find a Fractal"
              isLarge
              className="w-full"
            />
          </Link>
        </div>
      </ContentBox>
    </div>
  );
}

export default Home;
