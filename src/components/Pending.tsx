import Loading from "./ui/svg/Loading"

const Pending = ({
  pending,
  message
}: {
  pending: boolean,
  message: string
}) => {
  return (
    <div>
      {pending &&
        <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen overflow-hidden opacity-75 bg-gray-700 flex flex-col items-center justify-center z-50">
          <h2 className="text-center text-xl text-white font-semibold">{message}</h2>
          <p className="w-1/3 text-center text-white pt-2 pb-4">Please be Patient</p>
          <Loading/>
        </div>
      }
    </div>
  )
}

export default Pending