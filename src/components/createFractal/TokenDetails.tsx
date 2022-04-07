import CreateDAOInput from '../ui/CreateDAOInput'

const TokenDetails = ({ formData, setFormData }:
  {
    formData: {
      tokenName: string,
      tokenSymbol: string,
      tokenSupply: number,
    },
    setFormData: any,
  }
) => {
  const handleNameChange = (event: any) => {
    setFormData({ ...formData, tokenName: event.target.value })
  }

  const handleSymbolChange = (event: any) => {
    setFormData({ ...formData, tokenSymbol: event.target.value })
  }
  const handleSupplyChange = (event: any) => {
    setFormData({ ...formData, tokenSupply: event.target.value })
  }
  return (
    <div>
      <CreateDAOInput
        dataType="text"
        value={formData.tokenName}
        onChange={handleNameChange}
        label="Token Name"
        helperText="What is your governance token called?"
        disabled={false}
      />

      <CreateDAOInput
        dataType="text"
        value={formData.tokenSymbol}
        onChange={handleSymbolChange}
        label="Token Symbol"
        helperText="Max: 5 chars"
        disabled={false}
      />

      <CreateDAOInput
        dataType="text"
        value={formData.tokenSupply === 0 ? "" : formData.tokenSupply}
        onChange={handleSupplyChange}
        label="Token Supply"
        helperText="Whole numbers only"
        disabled={false}
      />
    </div>
  )
}

export default TokenDetails