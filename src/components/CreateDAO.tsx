import React, {useEffect, useState} from 'react'
import { DAOFactory, DAOFactory__factory } from '../typechain-types';
import DAODetails from './DAODetails';
import GovernanceDetails from './GovernanceDetails';
import TokenDetails from './TokenDetails';
import { useWeb3 } from '../web3';
import { ContractReceipt, ContractTransaction } from '@ethersproject/contracts';


const CreateDAO = () => {
  const[step, setStep] = useState(0);
  const[formData, setFormData] = useState({
    DAOName: "",
    tokenName: "",
    tokenSymbol: "",
    tokenSupply: 0,
    proposalThreshold: 0,
    quorum: 4,
    executionDelay: 24, 
  })

  const FormTitles = ["Essentials", "Mint a New Token", "Governance Setup"];

  const StepDisplay = () => {
    if(step === 0) {
      return <DAODetails formData={formData} setFormData={setFormData}/>
    } else if(step === 1) {
      return <TokenDetails formData={formData} setFormData={setFormData}/>
    } else {
      return <GovernanceDetails formData={formData} setFormData={setFormData}/>
    }
  }

  const { signerOrProvider } = useWeb3();
  const DeployDAO = async (DAOName: string, tokenName: string, tokenSymbol: string, tokenSupply: number) => {
      if (!DAOName || !tokenName || !tokenSymbol || !tokenSupply || !signerOrProvider) {
        return;
      }
      const factory: DAOFactory = DAOFactory__factory.connect("0x5FbDB2315678afecb367f032d93F642f64180aa3", signerOrProvider)

      const createDAOParams = {
        daoImplementation: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
        accessControlImplementation: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
        daoName: DAOName,
        roles: ['EXECUTE_ROLE','UPGRADE_ROLE'],
        rolesAdmins: ['DAO_ROLE','DAO_ROLE'],
        members: [['0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266','0x70997970c51812dc3a010c7d01b50e0d17dc79c8'],['0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266']],
        daoFunctionDescs: ['execute(address[],uint256[],bytes[])','upgradeTo(address)'],
        daoActionRoles: [['EXECUTE_ROLE'],['EXECUTE_ROLE','UPGRADE_ROLE']],
        moduleTargets: [],
        moduleFunctionDescs: [],
        moduleActionRoles: []
      } 
      
      const receipt: ContractReceipt = await (await factory.connect(signerOrProvider).createDAO("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", createDAOParams)).wait()
      const treasuryCreatedEvent = receipt.events?.filter((x) => {
        return x.event === "DAOCreated";
      });

      if (
        treasuryCreatedEvent === undefined ||
        treasuryCreatedEvent[0].args === undefined ||
        treasuryCreatedEvent[0].args.daoAddress === undefined
      ) {
        return "";
      } else {
        console.log( treasuryCreatedEvent[0].args.daoAddress);
      }
  }


  return (
    <div className= "mx-24">
      <div className="mt-24 text-xl">{formData.DAOName === "" ? "New Fractal Configuration" : formData.DAOName + " - Configuration" }</div>
      <div className="container mx-auto bg-slate-100 px-8 mt-4 mb-8 pt-8 pb-8 content-center">
        <div className= "pb-8 text-lg">{FormTitles[step]}</div>
        <form>
          <div>{StepDisplay()}</div>
        </form>
      </div>
      <div className= "flex items-center justify-center">
        <button 
            disabled = {step === 0}
            className = "px-8 py-2 border rounded shadow items-center"
            onClick={ () =>
            {setStep((currPage) => currPage - 1)}
        }>
              Prev
        </button>
        <button 
          className = "px-8 py-2 border rounded shadow"
            onClick={ () =>
              {
                if(step === FormTitles.length - 1) {
                  DeployDAO(formData.DAOName, formData.tokenName, formData.tokenSymbol, formData.tokenSupply)
                } else {
                  setStep((currPage) => currPage + 1)}
                }
              }> 
              {step === FormTitles.length - 1 ? "Create DAO" : "Next"}
          </button>
      </div>
    </div>
  )
}

export default CreateDAO