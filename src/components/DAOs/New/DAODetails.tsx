import { useEffect } from 'react';
import ContentBoxTitle from '../../ui/ContentBoxTitle';
import CreateDAOInput from '../../ui/CreateDAOInput';

const DAODetails = ({
  setPrevEnabled,
  setNextEnabled,
  name,
  setName,
}: {
  setPrevEnabled: React.Dispatch<React.SetStateAction<boolean>>,
  setNextEnabled: React.Dispatch<React.SetStateAction<boolean>>,
  name: string | undefined,
  setName: React.Dispatch<React.SetStateAction<string | undefined>>,
}) => {
  useEffect(() => {
    setPrevEnabled(false);
  }, [setPrevEnabled]);

  useEffect(() => {
    setNextEnabled(name !== undefined && name.trim() !== "")
  }, [name, setNextEnabled]);

  return (
    <div>
      <ContentBoxTitle>
        Essentials
      </ContentBoxTitle>
      <CreateDAOInput
        dataType="text"
        value={name}
        onChange={setName}
        label="Fractal Name"
        helperText="What is your Fractal called?"
        disabled={false}
      />
    </div>
  );
}

export default DAODetails;
