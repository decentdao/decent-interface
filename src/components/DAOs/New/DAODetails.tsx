import CreateDAOInput from '../../ui/CreateDAOInput';

const DAODetails = ({ formData, setFormData }:
  {
    formData: {
      DAOName: string,
    },
    setFormData: any,
  }
) => {
  const handleChange = (event: any) => {
    setFormData({ ...formData, DAOName: event.target.value });
  }
  return (
    <div>
      <CreateDAOInput
        dataType="text"
        value={formData.DAOName}
        onChange={handleChange}
        label="Fractal Name"
        helperText="What is your Fractal called?"
        disabled={false}
      />
    </div>
  );
}

export default DAODetails;
