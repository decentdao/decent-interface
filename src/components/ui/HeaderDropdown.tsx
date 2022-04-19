import { Menu, Transition } from '@headlessui/react'
import DownArrow from './svg/DownArrow';

const HeaderDropdown = (
  { disconnect }:
    { disconnect: () => void }
) => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative inline-block text-left">
        <Menu>
          {({ open }) => (
            <>
              <Menu.Button className="text-sm font-medium text-white transition duration-150 ease-in-out hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue">
                <DownArrow/>
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
                <Menu.Items
                  static
                  className="absolute right-0 w-36 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none"
                >
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={disconnect}
                          className={`${active
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700"
                            } flex justify-between w-full px-4 py-2 text-sm leading-5 text-left`}
                        >
                          Disconnect
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </>
          )}
        </Menu>
      </div>
    </div>
  );

}

export default HeaderDropdown