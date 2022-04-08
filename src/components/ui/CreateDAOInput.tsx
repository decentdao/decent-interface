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
    <div>
      <div className="text-sm">{label}</div>
      <div className="grid grid-cols-3 gap-4 pb-2">
        <input
          className="col-span-2 w-full border rounded py-1 px-2 shadow-inner"
          type={dataType}
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
        />
        <div className="text-sm text-center">{helperText}</div>
      </div>
    </div>
  );
}

export default CreateDAOInput;
