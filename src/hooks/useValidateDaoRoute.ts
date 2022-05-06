import { ReactText, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useSearchDao from "./useSearchDao";

const useValidateDaoRoute = () => {
  const params = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { errorMessage, loading, address, addressIsDAO, updateSearchString } = useSearchDao();
  let toastId = useRef<ReactText>("")  
  // passes address string to useSearchDao hook
  useEffect(() => {
    updateSearchString(params.address!);
  }, [updateSearchString, params.address]);

  // when there was error
  useEffect(() => {
    if (errorMessage) {
      toast(errorMessage, {
        onOpen: () => {
          navigate("/")
          toast.dismiss(toastId.current);
        },
      });
    }
  }, [errorMessage, navigate]);

  // when dao is valid
  useEffect(() => {
    if (addressIsDAO && loading === false && address) {
      navigate(pathname!, { state: { validatedAddress: address } });
      toast.dismiss(toastId.current);
    }
  }, [addressIsDAO, loading, address, pathname, navigate]);

  // while dao is loading
  useEffect(() => {
    toastId.current = toast("Loading...", {
      toastId: "0",
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      progress: 1,
    });
    return () => {
      toast.dismiss(toastId.current);
    };
  }, []);
}

export default useValidateDaoRoute;