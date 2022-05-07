import { PrimaryButton, SecondaryButton, TextButton } from "../ui/forms/Button";
import LeftArrow from "../ui/svg/LeftArrow";
import RightArrow from "../ui/svg/RightArrow";

interface ButtonStepControllerProps {
  step: number;
  isPrimaryDisabled: boolean;
  isPrevEnabled: boolean;
  isNextEnabled: boolean;
  decrement(): void;
  increment(): void;
  deploy(): void;
}

const ButtonStepController = ({ step, isPrimaryDisabled, isPrevEnabled, isNextEnabled, decrement, increment, deploy }: ButtonStepControllerProps) => {
  switch (step) {
    case 0:
      return <TextButton onClick={decrement} disabled={!isPrevEnabled} icon={<LeftArrow />} label="Prev" />;
    case 1:
      return <PrimaryButton onClick={deploy} label="Deploy" isLarge disabled={isPrimaryDisabled} />;
    case 2:
      return <SecondaryButton onClick={increment} disabled={!isNextEnabled} isIconRight icon={<RightArrow />} label="Next" />;
    default:
      // should not reach here
      return <></>;
  }
};

export default ButtonStepController;
