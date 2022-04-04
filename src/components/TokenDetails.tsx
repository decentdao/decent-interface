import React from 'react'

const TokenDetails = ({formData, setFormData}:
  {
    formData: {
      tokenName: string,
      tokenSymbol: string,
      tokenSupply: number,
    },
    setFormData:any,
  }
  
  
  ) => {
  return (
    <div>
      <div className="text-sm">Token Name</div>
      <div className = "grid grid-cols-3 gap-4">
        <input 
        className="col-span-2 w-full border rounded py-1 px-2 shadow-inner"
        type ="text" 
        value= {formData.tokenName} 
        onChange = {(event) => setFormData({...formData, tokenName: event.target.value})}
        />
        <div className="text-sm text-center">What is your governance token called?</div>
      </div>
      <div className="text-sm pt-4">Token Symbol</div>
      <div className = "grid grid-cols-3 gap-4">
        <input 
          className="col-span-2 w-full border rounded py-1 px-2 shadow-inner"
          type ="text" 
          value= {formData.tokenSymbol} 
          onChange = {(event) => setFormData({...formData, tokenSymbol: event.target.value})}
          />
        <div className="text-sm text-center">Max: 5 chars</div>
      </div>
      <div className="text-sm pt-4">Token Supply</div>
      <div className = "grid grid-cols-3 gap-4"> 
        <input 
          className="col-span-2 w-full border rounded py-1 px-2 shadow-inner"
          type ="number" 
          value= {formData.tokenSupply === 0 ? "" : formData.tokenSupply} 
          onChange = {(event) => setFormData({...formData, tokenSupply: event.target.value})}
        />
        <div className="text-sm text-center">Whole numbers only</div>
      </div>
    </div>
  )
}

export default TokenDetails