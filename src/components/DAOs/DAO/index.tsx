import { useState, useEffect } from "react";
import { Routes, Route, useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Summary from "./Summary";
import Details from "./Details";
import Proposals from "./Proposals";
import Delegate from "./Delegate";
import { useDAOData } from "../../../daoData";

import useSearchDao from "../../../hooks/useSearchDao";
import { useWeb3 } from "../../../web3Data";

function DAORoutes() {
  return (
    <Routes>
      <Route index element={<Summary />} />
      <Route path="details" element={<Details />} />
      <Route path="delegate" element={<Delegate />} />
      <Route path="proposals/*" element={<Proposals />} />
    </Routes>
  );
}

function ValidDAO({ address }: { address: string }) {
  const [, setDAOAddress] = useDAOData();

  useEffect(() => {
    setDAOAddress(address);
  }, [address, setDAOAddress]);
  return <DAORoutes />;
}

function Search() {
  const params = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { errorMessage, loading, address, addressIsDAO, updateSearchString } = useSearchDao();

  // passes address string to useSearchDao hook
  useEffect(() => {
    updateSearchString(params.address!);
  }, [updateSearchString, params.address]);

  // when there was error
  useEffect(() => {
    if (errorMessage) {
      toast(errorMessage, {
        onOpen: () => navigate("/"),
      });
    }
  }, [errorMessage, navigate]);

  // when dao is valid
  useEffect(() => {
    if (addressIsDAO && loading === false && address) {
      navigate(pathname!, { state: { validatedAddress: address } });
    }
  }, [addressIsDAO, loading, address, pathname, navigate]);

  // while dao is loading
  useEffect(() => {
    const toastId = toast("Loading...", {
      toastId: "0",
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      progress: 1,
    });
    return () => {
      toast.dismiss(toastId);
    };
  }, []);

  return <></>;
}

function DAO() {
  const location = useLocation();
  const navigate = useNavigate();
  const [{ account, accountLoading, chainId }] = useWeb3();
  const [, setAddress] = useDAOData();

  const [validatedAddress, setValidatedAddress] = useState((location.state as { validatedAddress: string } | null)?.validatedAddress);
  useEffect(() => {
    if (!location || !location.state) {
      setValidatedAddress(undefined);
      return;
    }

    const locationState = location.state as { validatedAddress: string };
    setValidatedAddress(locationState.validatedAddress);
  }, [location]);

  useEffect(() => {
    if (account || accountLoading) {
      return;
    }

    navigate("/");
    toast("Connect a wallet to load a DAO");
  }, [account, accountLoading, navigate]);

  // when this component unloads, setAddress back to undefined to clear app state
  useEffect(() => () => setAddress(undefined), [setAddress]);
  // if network changes remove address validation.
  useEffect(() => () => setValidatedAddress(undefined), [chainId]);

  if (validatedAddress) {
    return <ValidDAO address={validatedAddress} />;
  }

  return <Search />;
}

export default DAO;
