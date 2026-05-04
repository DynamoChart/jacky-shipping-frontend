import { useState,useEffect } from "react";
import { Button, Chip ,Avatar} from "@heroui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { FileSpreadsheet } from "lucide-react";

import { useAppContext } from "./context/DataContext";
import { ChevronLeft, ChevronRight,ScrollText, PackageSearch,CircleUser,Sun, Moon, Users, Factory, ChartPie, ShoppingBasket, LogOut } from "lucide-react";
import {
  ChevronDown,
  CodeFork,
  Ellipsis,
  ArrowsRotateLeft,
  Funnel,
  BarsDescendingAlignCenter,
  ArrowRightToSquare
} from "@gravity-ui/icons";

import logodd from "./logoin.jpeg";

export default function Sidebar({isDark,setIsDark}) {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get logout function from context
  const { logout, user } = useAppContext();

  const toggleTheme = () => {
    setIsDark(!isDark);
  };





  const menuItems = [
    { icon: <ChartPie size={22} />, label: "Dashboard", path: "/" },
    { icon: <FileSpreadsheet size={22} />, label: "Work Sheet", path: "/sheet" },
    { icon: <PackageSearch size={22} />, label: "Shipments", path: "/shipments" },
    // { icon: <Users size={22} />, label: "Customers", path: "/customers" },
    { icon: <Factory size={22} />, label: "Plants", path: "/plants" },
    { icon: <ScrollText size={22} />, label: "Items", path: "/items" },
 
    // Users button - visible only to ADMIN
  
    ...(user?.role === 'admin' ? [{ 
      icon: <CircleUser size={22} />, 
      label: "Users", 
      path: "/users" 
    }] : []),
  ];

  const menuItems2 = [
    { icon: <ArrowRightToSquare size={22} />, label: "Logout" },
  ];

  // Proper Logout Function
  const handleLogout = () => {
    logout();                    // This clears context + localStorage
    navigate("/login", { replace: true });
  };

  return (
    <aside 
      className={`h-screen ${isDark?"bg-black":"bg-white"} border-r border-divider transition-[width] duration-300 ease-in-out flex flex-col pl-4 shadow-xl relative ${isOpen ? "w-45" : "w-15"}`}
    >
      {/* Toggle button */}
      <Button 
        isIconOnly 
        size="sm" 
        variant="solid" 
        className="absolute -right-3 top-3 rounded-full border shadow-md z-50" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </Button>

      <div className="flex items-center justify-center mr-6">
        <img 
          src={logodd} 
          alt="Logo" 
          className={`${isOpen ? "w-full h-10 mt-4" : "w-0 h-10 mt-4"}`} 
        />
      </div>

      {/* Main Menu */}
      <div className="flex flex-col gap-1 mt-8 flex-grow overflow-hidden">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Button 
              key={item.path}
              variant={isActive ? "danger-soft" : ""}
              color={isActive ? "primary" : "default"}
              className={`
                flex items-center gap-0 w-[150px] justify-start h-10 border overflow-hidden
                transition-all duration-200
                ${!isActive && "hover:bg-blue-500/10 hover:text-blue-600"}
              `}
              size="sm"
              onClick={() => navigate(item.path)}
            >
              <div className="min-w-[24px] flex justify-center">{item.icon}</div>
              <span className={`transition-opacity duration-300 whitespace-nowrap ${isOpen ? "opacity-100" : "opacity-0"}`}>
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>

      {/* Logout Section */}
          {/* Logout Section */}
          <div className="mt-auto mb-4">
        <div className="flex flex-col gap-1 overflow-hidden">
            {/* User Info - Added below logout */}
                {/* User Info - Nice version with Avatar */}
                      {/* User Info - Nice & Clean with Avatar */}
                 {/* User Info inside Chip */}
                 {user && (
            <Chip 
              variant="soft" 
              color="success"
              className={`w-[150px] p-0.5 shadow-sm cursor-default overflow-hidden ${isOpen ? "opacity-100" : "opacity-0"}`}
              size="lg"
            >
              {isOpen ? (
                /* Expanded - Avatar + Name + Email */
                <div className="flex items-center gap-1 w-full">
                  <Avatar 
                    color="accent"
                    variant="soft"
                    size="sm"
                    className="flex-shrink-0"
                  >
                    <Avatar.Fallback>
                      {user.name 
                        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) 
                        : 'U'}
                    </Avatar.Fallback>
                  </Avatar>

                  <div className="min-w-0 flex-1 text-left">
                    <div className={`text-xs font-medium text-foreground truncate ${isDark?"text-white":"text-balck"}`}>
                      {user.name}
                    </div>
                    <div className="text-xs text-default-500 truncate -mt-0.5">
                      {user.email}
                    </div>
                  </div>
                </div>
              ) : (
                /* Collapsed - Only centered Avatar */
                <div className="flex justify-center w-full">
                  <Avatar 
                    color="accent" 
                    variant="soft"
                    size="md"
                    className="shadow-md"
                  >
                    <Avatar.Fallback>
                      {user.name 
                        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) 
                        : 'U'}
                    </Avatar.Fallback>
                  </Avatar>
                </div>
              )}
            </Chip>
          )}
          {/* Theme Toggle - unchanged */}
          <Chip 
            variant="soft"
            color="default"
            className="flex items-center gap-0 w-[150px] justify-start h-7 text-xs cursor-pointer overflow-hidden hover:bg-default-100 dark:hover:bg-default-800"
            size="lg"
            onClick={toggleTheme}
          >
            <div className="min-w-[24px] flex justify-center">
              {isDark ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <span className={`transition-opacity duration-300 whitespace-nowrap ${isOpen ? "opacity-100" : "opacity-0"}`}>
              {isDark ? "Light Mode" : "Dark Mode"}
            </span>
          </Chip>

          {/* Logout Button - unchanged */}
          {menuItems2.map((item) => (
            <Chip 
              key={item.label}
              variant="soft"
              color="warning"
              className="flex items-center gap-0 w-[150px] justify-start h-7 mb-2 text-xs cursor-pointer overflow-hidden hover:bg-[#fae5c5]"
              size="lg"
              onClick={handleLogout}
            >
              <div className="min-w-[24px] flex justify-center">{item.icon}</div>
              <span className={`transition-opacity duration-300 whitespace-nowrap ${isOpen ? "opacity-100" : "opacity-0"}`}>
                {item.label}
              </span>
            </Chip>
          ))}

        

        </div>
      </div>
    </aside>
  );
}