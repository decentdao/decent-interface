import { ContractReceipt } from 'ethers';
import React from 'react'
import { DAOFactory, DAOFactory__factory } from '../typechain-types';

    const DeployDAO = async (DAOName: string, tokenName: string, tokenSymbol: string, tokenSupply: number, signer: any, navigate: any) => {
        if (!DAOName || !tokenName || !tokenSymbol || !tokenSupply || !signer) {
          return;
        }
        const factory: DAOFactory = DAOFactory__factory.connect("0x5FbDB2315678afecb367f032d93F642f64180aa3", signer)
  
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
        
        const receipt: ContractReceipt = await (await factory.connect(signer).createDAO("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", createDAOParams)).wait()
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
          console.log(treasuryCreatedEvent[0].args.daoAddress );
          navigate(`/daos/${treasuryCreatedEvent[0].args.daoAddress}`,)
        }
    }


export default DeployDAO