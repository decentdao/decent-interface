import { Menu, Transition } from "@headlessui/react";
import DownArrow from "../svg/DownArrow";
import MenuItems from "./MenuItems";

const HeaderMenu = () => {
  return (
    <div className="flex items-center justify-center relative">
      <Menu>
        {({ open }) => (
          <>
            <Menu.Button className="text-sm font-medium text-white transition duration-150 ease-in-out hover:text-stone-300 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue align-middle">
              <DownArrow />
            </Menu.Button>

            <Transition
              show={open}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <MenuItems />
            </Transition>
          </>
        )}
      </Menu>
    </div>
  );
};

export default HeaderMenu;
