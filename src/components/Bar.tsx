import { Outlet } from 'react-router-dom';

function Bar() {
  return (
    <div>
      <div>bar</div>
      <Outlet />
    </div>
  )
}

export default Bar;
