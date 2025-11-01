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
import Setting from "./pages/Setting.jsx";
import Login from "./pages/Login";
import Contact from "./pages/Contact.jsx";
import GeneralInfo from "./pages/Generalinfo.jsx";
import Header from "./components/common/Header";
import NotFound from "./pages/NotFound"
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext.jsx";

import './assets/css/theme.css'; // Import theme styles and variables
import  './index.css' // Import Tailwind components and utilities
import './assets/css/output.css'; // Import compiled Tailwind CSS

function ProtectedRoute({children}) {
  const {user,logout} = useAuth();

  // Listen for unauthorized events to log out the user
    useEffect(() => {
      // Handler for unauthorized event
      const handleUnauthorized = () => {
        console.log("Unauthorized event received, logging out");
        logout();
      };
      
      // Add event listener for unauthorized events
      window.addEventListener('unauthorized', handleUnauthorized);
      
      // Cleanup function to remove the old event listener 
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
  { path: "/general-info", element: <GeneralInfo /> },
  { path: "/contact", element: <Contact /> },
  { path: "/settings", element: <Setting /> },
];

function App() {

  return (
  <ThemeProvider>
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
  </ThemeProvider>
  )
}
export default App