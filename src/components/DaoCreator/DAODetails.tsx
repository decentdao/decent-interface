import { useEffect } from 'react';
import Input from '../ui/forms/Input';
import InputBox from '../ui/forms/InputBox';
import ContentBoxTitle from '../ui/ContentBoxTitle';
interface DaoDetailsProps {
  name?: string;
  setPrevEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setNextEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setName: React.Dispatch<React.SetStateAction<string>>;
}
function DAODetails({ name, setPrevEnabled, setNextEnabled, setName }: DaoDetailsProps) {
  useEffect(() => {
    setPrevEnabled(false);
  }, [setPrevEnabled]);

  useEffect(() => {
    setNextEnabled(name !== undefined && name.trim() !== '');
  }, [name, setNextEnabled]);

  return (
    <div>
      <ContentBoxTitle>Essentials</ContentBoxTitle>
      <InputBox>
        <Input
          type="text"
          value={name!}
          onChange={e => setName(e.target.value)}
          label="Fractal Name"
          helperText="What is your Fractal called?"
        />
      </InputBox>
    </div>
  );
}

export default DAODetails;
