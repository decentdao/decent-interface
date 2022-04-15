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
      <div className="grid grid-cols-3 gap-4">
        <input
          className="col-span-2 w-full border border-lightBlack bg-medBlack rounded py-1 text-mediumGray pl-2"
          type={dataType}
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
        />
        <div className="text-sm text-mediumGray text-center">{helperText}</div>
        </div>
      </div>
    </div>
  );
}

export default CreateDAOInput;
