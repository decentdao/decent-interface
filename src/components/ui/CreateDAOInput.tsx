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
    <div className="bg-gray-500 rounded-lg my-4">
      <div className= "px-4 py-4">
      <div className="text-sm text-gray-50 pb-2">{label}</div>
      <div className="md:grid md:grid-cols-3 md:gap-4 flex flex-col items-center">
        <input
          className="md:col-span-2 w-full border border-gray-200 bg-gray-400 rounded py-1 px-2 text-gray-50"
          type={dataType}
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
        />
        <div className="md:pt-0 pt-2 text-sm text-gray-50 text-center">{helperText}</div>
        </div>
      </div>
    </div>
  );
}

export default CreateDAOInput;
