// src/components/Sidebar.tsx
import { FaHome, FaBookOpen, FaTasks, FaUser, FaTimes, FaQuestionCircle, FaGraduationCap, FaProjectDiagram } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import SupportModal from "./SupportModal";


interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showSupport, setShowSupport] = useState(false);


  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleProfileClick = () => {
    navigate("/dashboard/profile");
    onClose();
  };

  const menuItems = [
    { path: "/dashboard", icon: FaHome, label: "Dashboard" },
    { path: "/dashboard/courses", icon: FaBookOpen, label: "My Courses" },
    { path: "/dashboard/assignments", icon: FaTasks, label: "Assignments" },
    { path: "/dashboard/project", icon: FaProjectDiagram, label: "Project" },
    { path: "/dashboard/profile", icon: FaUser, label: "My Profile" },
    { path: "/dashboard/support", icon: FaQuestionCircle, label: "Support Tickets" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-lfc-red to-lfc-red/80 text-white transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:flex md:flex-shrink-0 shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col w-full h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-lfc-gold/30">
            <div className="flex items-center space-x-3">
              <div className="relative h-12 w-12 bg-white rounded-xl p-2">
                <img 
                  src="/logo.png" 
                  alt="LFC Jahi Tech" 
                />
              </div>
              <div>
                <span className="text-xl font-bold block">LFC Jahi Tech</span>
                <span className="text-xs text-white/70">Student Portal</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="md:hidden text-white hover:bg-lfc-gold/20 p-2 rounded-lg"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {/* User Profile */}
          <div 
            onClick={handleProfileClick}
            className="flex items-center px-6 py-4 border-b border-lfc-gold/20 bg-lfc-red/60 cursor-pointer hover:bg-lfc-red/70 transition-all duration-200 group"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full border-2 border-lfc-gold animate-pulse opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="h-14 w-14 rounded-full border-2 border-lfc-gold flex-shrink-0 overflow-hidden">
                <img
                  className={`h-full w-full object-cover ${
                    !user?.profilePicture?.url ? "filter brightness-0 invert" : ""
                  }`}
                  src={user?.profilePicture?.url || "/default-avatar.png"}
                  alt="User profile"
                />
              </div>
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="text-sm font-semibold truncate" title={user?.name || "User"}>
                {user?.name || "Loading..."}
              </p>
              <p className="text-xs text-white/80 truncate" title={user?.email || ""}>
                {user?.email || ""}
              </p>
              <div className="flex items-center mt-1">
                <FaGraduationCap className="text-lfc-gold text-xs mr-1" />
                <span className="text-xs text-lfc-gold">Student</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col flex-grow px-4 py-6 overflow-y-auto scrollbar-hide">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                      hover:bg-lfc-gold hover:text-lfc-red hover:scale-105
                      ${isActive(item.path) 
                        ? "bg-lfc-gold text-lfc-red shadow-lg scale-105" 
                        : "text-white"
                      }
                    `}
                  >
                    <Icon className="mr-3 text-lg flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Help Section */}
            <div className="mt-auto mb-6">
              <div className="bg-lfc-red/60 rounded-2xl p-4 border border-lfc-gold/30 backdrop-blur-sm">
                <div className="flex items-center mb-2">
                  <FaQuestionCircle className="text-lfc-gold mr-2 text-lg" />
                  <h3 className="text-sm font-semibold">Need help?</h3>
                </div>
                <p className="text-xs text-white/80 mb-3">Our support team is here to help you</p>
                <button
                  onClick={() => setShowSupport(true)}
                  className="w-full bg-white text-lfc-red py-2 px-3 rounded-lg text-sm font-medium hover:bg-lfc-gold transition-all duration-200 hover:scale-105"
                >
                  Contact Support
                </button>

                {showSupport && (
                  <SupportModal isOpen={showSupport} onClose={() => setShowSupport(false)} />
                )}
              </div>
              
              {/* Footer */}
              <div className="mt-4 text-center">
                <p className="text-xs text-white/60">© 2025 LFC Jahi Tech</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;