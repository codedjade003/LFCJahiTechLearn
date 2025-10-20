// src/components/Sidebar.tsx
import { FaHome, FaBookOpen, FaTasks, FaUser, FaTimes, FaQuestionCircle, FaGraduationCap, FaProjectDiagram, FaChevronLeft, FaBars } from "react-icons/fa";
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
  const [collapsed, setCollapsed] = useState(false);


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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile header button */}
      <button
        onClick={onClose}
        className="lg:hidden fixed top-4 left-4 z-30 bg-lfc-red dark:bg-[var(--lfc-red)] text-white p-2 rounded-lg shadow-lg"
      >
        <FaBars className="text-lg" />
      </button>
      
      {/* Sidebar */}
      <div className={`
        fixed lg:relative ${collapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-lfc-red to-lfc-red/90 dark:from-red-800 dark:to-red-900 text-white flex flex-col transition-all duration-300 h-screen transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        shadow-2xl border-r border-lfc-gold/30 dark:border-red-700/30
      `}>
        <div className="flex flex-col w-full h-full">
          {/* Header */}
          <div className="mt-1 flex items-center justify-between p-4 border-b border-lfc-gold/30 dark:border-red-700/30">
            <div className="flex items-center space-x-3">
              <div className="relative h-10 w-10 bg-white rounded-xl p-1">
                <img 
                  src="/logo.png" 
                  alt="LFC Jahi Tech"
                />
              </div>
              {!collapsed && (
                <div>
                  <span className="text-lg font-bold block text-white">LFC Jahi Tech</span>
                  <span className="text-xs text-white/80">Student Portal</span>
                </div>
              )}
            </div>
            
            {/* Collapse Button - Desktop */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/20 transition-colors text-white"
            >
              <FaChevronLeft
                className={`transform transition-transform duration-300 ${
                  collapsed ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Close Button - Mobile */}
            <button 
              onClick={onClose}
              className="lg:hidden text-white hover:bg-white/20 p-2 rounded-lg"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {/* User Profile */}
          <div 
            onClick={handleProfileClick}
            className="p-4 border-b border-lfc-gold/30 dark:border-red-700/30 bg-lfc-red/50 dark:bg-red-900/50 cursor-pointer hover:bg-lfc-red/70 dark:hover:bg-red-900/70 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-full border-2 border-lfc-gold animate-pulse opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className={`${collapsed ? 'h-10 w-10' : 'h-12 w-12'} rounded-full border-2 border-lfc-gold flex-shrink-0 overflow-hidden transition-all duration-300`}>
                  <img
                    className={`h-full w-full object-cover ${
                      !user?.profilePicture?.url ? "filter brightness-0 invert" : ""
                    }`}
                    src={user?.profilePicture?.url || "/default-avatar.png"}
                    alt="User profile"
                  />
                </div>
              </div>
              
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate text-white" title={user?.name || "User"}>
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
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col flex-grow px-2 py-4 overflow-y-auto scrollbar-hide">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                      ${isActive(item.path) 
                        ? "bg-lfc-gold text-lfc-red shadow-md" 
                        : "text-white hover:bg-lfc-gold hover:text-lfc-red"
                      }
                    `}
                  >
                    <Icon className={`${collapsed ? '' : 'mr-3'} text-lg flex-shrink-0`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </nav>

            {/* Help Section */}
            {!collapsed && (
              <div className="mt-auto mb-4">
                <div className="bg-lfc-red/60 dark:bg-red-900/60 rounded-xl p-4 border border-lfc-gold/30 dark:border-red-700/30">
                  <div className="flex items-center mb-2">
                    <FaQuestionCircle className="text-lfc-gold mr-2 text-lg" />
                    <h3 className="text-sm font-semibold text-white">Need help?</h3>
                  </div>
                  <p className="text-xs text-white/80 mb-3">Our support team is here to help you</p>
                  <button
                    onClick={() => setShowSupport(true)}
                    className="w-full bg-white text-lfc-red py-2 px-3 rounded-lg text-sm font-medium hover:bg-lfc-gold hover:text-white transition-all duration-200"
                  >
                    Contact Support
                  </button>

                  {showSupport && (
                    <SupportModal isOpen={showSupport} onClose={() => setShowSupport(false)} />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-lfc-gold/30 dark:border-red-700/30 pb-safe">
            {!collapsed && (
              <div className="text-center">
                <p className="text-xs text-white/60">© 2025 LFC Jahi Tech</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
