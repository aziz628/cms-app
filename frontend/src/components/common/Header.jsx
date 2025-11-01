import authService from "../../services/authService";
import { useState } from "react";
import { useNotification } from '../../context/NotificationContext.jsx';
function Header() {
  const [loading, setLoading] = useState(false);
  const { error , success} = useNotification();

  async function handleLogout() {
    try {
      setLoading(true);
      await authService.logout();
      success("Logout successful");
    } catch (err) {
      error("Logout failed. Please try again.");
      console.error("Logout failed:", err);
    } finally {
      setLoading(false);
    }
  }
  return (
    <header className="z-40 fixed flex items-center h-16 px-4 py-3 text-white bg-black w-full shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gym CMS</h1>
          <button 
            onClick={handleLogout}
            disabled={loading}
            className="bg-danger border hover:border-hoverDanger text-btnText px-2 md:px-3 py-1 rounded hover:bg-hoverDanger"
          >
            <i className="fa-solid fa-right-from-bracket md:mr-1"></i>
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </header>
    );
}
export default Header;