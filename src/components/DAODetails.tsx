import React from 'react'

const DAODetails = ({formData, setFormData}:
  {
    formData: {
      DAOName: string,
    },
    setFormData:any,
  }
  
  
  ) => {
  return (
    <div>
      <div className="text-sm">Fractal Name</div>
      <div className = "grid grid-cols-3 gap-4">
        <input 
        className="col-span-2 w-full border rounded py-1 px-2 shadow-inner"
        type ="text" 
        value= {formData.DAOName} 
        onChange = {(event) => setFormData({...formData, DAOName: event.target.value})}
        />
        <div className="text-sm text-center">What is your Fractal called?</div>
      </div>
    </div>
  )
}

export default DAODetails