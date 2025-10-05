import { BrowserRouter as Router ,Routes,Route,Navigate} from "react-router-dom";
import { useEffect } from "react";
import { getCurrentPage } from "./utils/tools";
import Dashboard from "./pages/Dashboard";
import Classes from "./pages/Classes";
import Sidebar from "./components/layout/Sidebar";
import Schedule from "./pages/Schedule";
import Pricing from "./pages/Pricing";
import Trainers from "./pages/Trainers";
import Gallery from "./pages/Gallery";
import Events from "./pages/Events";
import Reviews from "./pages/Reviews";
import Transformations from "./pages/Transformations";
import Login from "./pages/Login";
import Header from "./components/common/Header";
import NotFound from "./pages/NotFound"
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { useAuth } from "./context/AuthContext";

import './assets/css/custum.css';
import './assets/css/output.css';

function ProtectedRoute({children}) {
  const {user,logout} = useAuth();

  // Listen for unauthorized events to log out the user
    useEffect(() => {
    const handleUnauthorized = () => {
      console.log("Unauthorized event received, logging out");
      logout();
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []); // Empty dependency array means "run once on mount"

  console.log("ProtectedRoute user:", user,"from page:", getCurrentPage());
  if(!user) {
    return <Navigate to="/login" />
  }
  return children;
}

function AdminLayout({children}) {
  return (
    <div className="min-h-screen w-full bg-bg text-text font-sans flex flex-col">
      <Header />
      <div className="mt-16 flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 ml-[44px] md:ml-[176px] overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
const routes = [
  { path: "/", element: <Dashboard /> },
  { path: "/classes", element: <Classes /> },
  { path: "/schedule", element: <Schedule /> },
  { path: "/pricing", element: <Pricing /> },
  { path: "/trainers", element: <Trainers /> },
  { path: "/gallery", element: <Gallery /> },
  { path: "/events", element: <Events /> },
  { path: "/reviews", element: <Reviews /> },
  { path: "/transformations", element: <Transformations /> },
];

function App() {

  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/login" element={  /*check if user authed navigate to dashboard */
              <Login />} />
            {/* Protected routes */}
            
            {routes.map((route) => (
              <Route 
                key={route.path} 
                path={route.path} 
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      {route.element}
                    </AdminLayout>
                  </ProtectedRoute>
                } 
              />
            ))}
            {/* Catch-all route for 404 errors */}
            <Route path="*" element={<NotFound />} />
            
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  )
}
export default App