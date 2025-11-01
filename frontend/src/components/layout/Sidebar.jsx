import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();
  
  // Navigation items with paths and labels
  const navItems = [
    { path: "/", label: "Dashboard" , icon : "fa-solid fa-gauge" },
    { path: "/classes", label: "Classes", icon: "fa-solid fa-chalkboard-teacher" },
    { path: "/schedule", label: "Schedule", icon: "fa-solid fa-calendar" },
    { path: "/pricing", label: "Pricing", icon: "fa-solid fa-dollar-sign" },
    { path: "/trainers", label: "Trainers", icon: "fa-solid fa-user-friends" },
    { path: "/gallery", label: "Gallery", icon: "fa-solid fa-images" },
    { path: "/events", label: "Events", icon: "fa-solid fa-calendar-plus" },
    { path: "/reviews", label: "Reviews", icon: "fa-solid fa-star" },
    { path: "/transformations", label: "Transformations", icon: "fa-solid fa-arrow-up-right-from-square" },
    { path: "/general-info", label: "General Info", icon: "fa-solid fa-info-circle" },
    { path: "/contact", label: "Contact", icon: "fa-solid fa-envelope" },
    { path: "/settings", label: "Site Settings", icon: "fa-solid fa-cog" },
  ];

  return (
    // add any valid Tailwind value for width with w-4x class so it can be in 40s
    <aside className="w-11 fixed h-[calc(100vh-64px)] bg-bg shadow-md shadow-shadowColor p-2 md:p-3 md:w-44 overflow-y-auto">
        <ul className="space-y-3 md:space-y-1  ">
          {navItems.map((item) => (
            <li  key={item.path}>
              <Link
                to={item.path}
                className={`block relative px-3 py-2  md:py-[6px] rounded transition ${
                  location.pathname === item.path
                    ? "bg-tertiary text-blue-800 font-medium"
                    : "hover:bg-gray-100 text-muted hover:text-primary"
                }`}
              >
                <i className={`${item.icon} left-1 top-[calc(50%_-_0.5rem)]  absolute`}></i>
                <span className="hidden  md:block pl-4 ">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
    </aside>
  );
}

export default Sidebar;