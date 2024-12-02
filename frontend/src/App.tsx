import { useEffect } from "react";
import "./App.css";
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useNavigate,
} from "react-router-dom";
import SplashPage from "./components/SplashPage/SplashPage";
import { csrfFetch } from "./util/csrfFetch";
import Feed from "./components/Feed/Feed";
import Sidebar from "./components/Sidebar/Sidebar";
import { useAppDispatch, useAppSelector } from "./redux/util";
import { restoreUser } from "./redux/reducers/session";
import PostCreator from "./components/PostCreator/PostCreator";

if (import.meta.env.MODE !== "production") {
  (window as any).csrfFetch = csrfFetch;
}

function App() {
  const user = useAppSelector((state) => state.session.user);
  const dispatch = useAppDispatch();

  function Layout() {
    const navigate = useNavigate();

    useEffect(() => {
      if (user) return;

      dispatch(restoreUser()).then((action) => {
        // @ts-ignore
        if (action.type === "session/restoreUser/rejected") {
          navigate("/");
          return;
        }
      });
    }, [navigate]);
    return <Outlet />;
  }

  const router = createBrowserRouter([
    {
      element: <Layout />,
      path: "/",
      children: [
        {
          index: true,
          element: <SplashPage />,
        },
        {
          path: "/feed",
          element: (
            <div className="triple-pane">
              <Sidebar />
              <Feed subfeed={false} popular={false} />
            </div>
          ),
        },
        {
          path: "/new_post",
          element: (
            <div className="triple-pane">
              <Sidebar />
              <PostCreator />
            </div>
          ),
        },
        {
          path: "/edit/:postId",
          element: (
            <div className="triple-pane">
              <Sidebar />
              <PostCreator />
            </div>
          ),
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
