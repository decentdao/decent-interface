import { ReactElement } from "react";

interface DataLoadingWrapperProps {
  isLoading: boolean;
  children: ReactElement<any, any> | string;
}
/**
 *
 * @param isLoading
 * @param children
 * @returns
 */
const DataLoadingWrapper = ({ isLoading, children }: DataLoadingWrapperProps) => {
  if (isLoading) {
    return (
      <div className="w-12 h-full">
        <div className="animate-loading-flash animate-pulse bg-gradient-to-r from-transparent to-gray-25 h-full opacity-70"></div>
      </div>
    );
  }
  return <>{children}</>;
};

export default DataLoadingWrapper;
