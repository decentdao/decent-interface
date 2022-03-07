import { Outlet } from 'react-router-dom';

function Foo() {
  return (
    <div>
      <div>foo</div>
      <Outlet />
    </div>
  )
}

export default Foo;
