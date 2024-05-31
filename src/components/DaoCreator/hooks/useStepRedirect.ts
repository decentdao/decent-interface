import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreatorFormState } from "../../../types";
import { scrollToTop } from "../../../utils/ui";

export default function useStepRedirect(values: CreatorFormState) {
    const navigate = useNavigate();
    useEffect(() => {
        if (!values.essentials.daoName || !values.essentials.governance) {
          navigate('/create/essentials', { replace: true });
          scrollToTop();
        }
      }, [values.essentials.daoName, values.essentials.governance, navigate]);
}