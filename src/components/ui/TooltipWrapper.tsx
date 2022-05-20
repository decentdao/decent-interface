import Tippy from "@tippyjs/react/headless";
import { ReactNode} from "react";

// Popper library placement types
type BasePlacement = "top" | "bottom" | "right" | "left";
type VariationPlacement = "top-start" | "top-end" | "bottom-start" | "bottom-end" | "right-start" | "right-end" | "left-start" | "left-end";
type AutoPlacement = "auto" | "auto-start" | "auto-end";
type Placement = AutoPlacement | BasePlacement | VariationPlacement;

interface TooltipWrapperProps {
  content: ReactNode;
  children: ReactNode;
  placement?: Placement;
  isVisible?: boolean;
}

const TooltipWrapper = ({ content, placement = "bottom-start", children, isVisible }: TooltipWrapperProps) => {
  return (
    <Tippy
      // allows for interactive content
      interactive={true}
      visible={true}
      // default placement is bottom-start, other options typed above
      placement={placement}
      // allows for control over whether tool tip is triggered or not by changing it to a manual trigger.
      trigger={isVisible ? 'mouseenter focus' : 'manual'}
      // renders custom tooltip
      render={(attrs) => (
        <div id="tooltip" className="bg-gray-800 text-white rounded-lg py-2 px-4" {...attrs}>
          <div id="arrow" data-popper-placement="top" ></div>
          {content}
        </div>
      )}
    >
      <div>{children}</div>
    </Tippy>
  );
};

export default TooltipWrapper;
