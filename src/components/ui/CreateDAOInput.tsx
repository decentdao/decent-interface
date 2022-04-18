const CreateDAOInput = ({ dataType, value, onChange, label, helperText, disabled }:
  {
    dataType: string,
    value: string | undefined,
    onChange: (e: string) => void,
    label: string,
    helperText: string,
    disabled: boolean
  }) => {
  return (
    <div className="bg-lighterBlack rounded-lg my-4">
      <div className= "px-4 py-4">
      <div className="text-sm text-mediumGray pb-2">{label}</div>
      <div className="md:grid md:grid-cols-3 md:gap-4 flex flex-col items-center">
        <input
          className="md:col-span-2 w-full border border-lightBlack bg-medBlack rounded py-1 px-2 text-mediumGray"
          type={dataType}
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
        />
        <div className="md:pt-0 pt-2 text-sm text-mediumGray text-center">{helperText}</div>
        </div>
      </div>
    </div>
  );
}

export default CreateDAOInput;
