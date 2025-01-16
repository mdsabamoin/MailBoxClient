import logo from './logo.svg';
import './App.css';
import Signup from './components/Signup';
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Dashboard from './components/Dashboard';
import Inbox from './components/Inbox';
const router = createBrowserRouter([
  {
    path: "/",
    element: <Signup />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "*",
    element: <Signup/>,
  },
  {
    path:"/Inbox",
    element:<Inbox/>
  }
]);
function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
