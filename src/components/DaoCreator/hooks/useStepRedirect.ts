import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreatorFormState } from "../../../types";
import { scrollToTop } from "../../../utils/ui";

export default function useStepRedirect(values: CreatorFormState) {
    const navigate = useNavigate();
    useEffect(() => {
        // @dev we might be also checking for other required values at given step
        // However, only imaginable way how consequent step might be missing required data is from page reload
        // Thus, we can actually rely on just missing daoName and governance
        if (!values.essentials.daoName || !values.essentials.governance) {
          navigate('/create/essentials', { replace: true });
          scrollToTop();
        }
      }, [values.essentials.daoName, values.essentials.governance, navigate]);
}