// src/pages/ProfilePage.tsx
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import TechyBackground from "../../components/shared/TechyBackground";
import { 
  FaUser, FaEnvelope, FaCalendar, FaPhone, FaBriefcase, 
  FaBuilding, FaGlobe, FaLink, FaSave,
  FaMapMarkerAlt, FaHeart, FaCode, FaGithub, 
  FaLinkedin, FaInstagram, FaFacebook, FaCamera, FaEdit,
} from "react-icons/fa";
import { FaGraduationCap, FaPlus, FaXTwitter,
} from "react-icons/fa6";

// Add this interface near the top of your file, after the imports
interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number;
  current: boolean;
}

interface PasswordCriteria {
  minLength: boolean;
  hasUpperCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

const ProfilePage = () => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const { user, setUser, fetchUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  // Add these state variables at the top of your component
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
  const [showCoverPhotoEditor, setShowCoverPhotoEditor] = useState(false);
  const [coverPosition, setCoverPosition] = useState({ x: 50, y: 50 }); // Center position
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [isEditing, setIsEditing] = useState(false);
  // Password management state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [showPasswordCriteria, setShowPasswordCriteria] = useState(false);
  
  // Theme and preferences
  const { theme, setTheme } = useTheme();
  const [onboardingEnabled, setOnboardingEnabled] = useState(true);
  const [preferencesLoading, setPreferencesLoading] = useState(false);

  const passwordCriteria = useMemo<PasswordCriteria>(() => ({
    minLength: newPassword.length >= 8,
    hasUpperCase: /[A-Z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  }), [newPassword]);

  const allCriteriaMet = useMemo(() => 
    Object.values(passwordCriteria).every(Boolean),
    [passwordCriteria]
  );

  const passwordsMatch = useMemo(() => 
    confirmPassword === "" || newPassword === confirmPassword,
    [newPassword, confirmPassword]
  );


  if (!user) return <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-redCustom"></div>
  </div>;

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toISOString().split("T")[0];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUser((prev) => prev && { ...prev, [name]: value });
  };

  const handleAddressChange = (field: string, value: string) => {
    setUser((prev) => prev && { 
      ...prev, 
      address: { ...prev.address, [field]: value } 
    });
  };

  const handleSocialLinkChange = (platform: string, url: string) => {
    setUser((prev) => prev && { 
      ...prev, 
      socialLinks: { ...prev.socialLinks, [platform]: url } 
    });
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage("Please fill in all fields");
      return;
    }
    
    if (!allCriteriaMet) {
      setPasswordMessage("Password does not meet all requirements");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match");
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword: currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Password change failed");

      setPasswordMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMessage(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Fetch user preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/users/preferences`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setOnboardingEnabled(data.preferences?.onboardingEnabled !== false);
          // Only set theme if it's different from current theme to avoid unwanted switches
          if (data.preferences?.theme && data.preferences.theme !== theme) {
            // Don't override current theme on page load - user's current selection takes precedence
            // setTheme(data.preferences.theme);
          }
        }
      } catch (err) {
        console.error("Error fetching preferences:", err);
      }
    };
    fetchPreferences();
  }, []);

  // Update preferences
  const handlePreferenceUpdate = async (key: string, value: any) => {
    setPreferencesLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/users/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [key]: value }),
      });

      if (res.ok) {
        if (key === "theme") {
          setTheme(value);
        } else if (key === "onboardingEnabled") {
          setOnboardingEnabled(value);
        }
      }
    } catch (err) {
      console.error("Error updating preference:", err);
    } finally {
      setPreferencesLoading(false);
    }
  };


// Then update the education state with proper typing
  const [education, setEducation] = useState<Education[]>(user.education || []);

  const handleEducationChange = (index: number, field: keyof Education, value: string | number | boolean) => {
    const updatedEducation = [...education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    setEducation(updatedEducation);
    setUser((prev) => prev && { ...prev, education: updatedEducation });
  };

  const addEducation = () => {
    const newEducation = [...education, {
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startYear: new Date().getFullYear(),
      endYear: new Date().getFullYear(),
      current: false
    }];
    setEducation(newEducation);
    setUser((prev) => prev && { ...prev, education: newEducation });
  };

  const removeEducation = (index: number) => {
    const newEducation = education.filter((_, i) => i !== index);
    setEducation(newEducation);
    setUser((prev) => prev && { ...prev, education: newEducation });
  };

  // Update your handleSubmit function to include position data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");

        // Final username validation before submission
  if (user.username) {
    const validation = validateUsername(user.username);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }
    
      // Final availability check
      const isAvailable = await checkUsernameAvailability(user.username);
          if (!isAvailable) {
            setError("Username is already taken. Please choose another one.");
            return;
          }
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

      // Upload profile picture if changed - USE AUTH ROUTES
      if (profilePictureFile) {
        const pictureFormData = new FormData();
        pictureFormData.append("image", profilePictureFile); // Note: field name is 'image' not 'file'
        
        const pictureRes = await fetch(`${API_BASE}/api/auth/profile-picture`, {
          method: "PUT", // Note: PUT method, not POST
          headers: { 
            "Authorization": `Bearer ${token}`,
            // Don't set Content-Type for FormData
          },
          body: pictureFormData,
        });
        
        if (!pictureRes.ok) throw new Error("Profile picture upload failed");
        const pictureData = await pictureRes.json();
        
        // The response should contain the updated user with profilePicture
        if (pictureData.user) {
          setUser(pictureData.user);
        }
      }

      // Upload cover photo if changed - SEND POSITION DATA
      if (coverPhotoFile) {
        const coverFormData = new FormData();
        coverFormData.append("image", coverPhotoFile);
        coverFormData.append("coverPosition", JSON.stringify(coverPosition)); // Add position data
        
        const coverRes = await fetch(`${API_BASE}/api/auth/cover-photo`, {
          method: "PUT",
          headers: { 
            "Authorization": `Bearer ${token}`,
          },
          body: coverFormData,
        });
        
        if (!coverRes.ok) throw new Error("Cover photo upload failed");
        const coverData = await coverRes.json();
        
        if (coverData.user) {
          setUser(coverData.user);
        }
      }

      // Update profile (rest of your existing code remains the same)
      const res = await fetch(`${API_BASE}/api/auth/update-profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Profile update failed");

      setSuccess("Profile updated successfully!");
      setUser(data.user);
      setProfilePictureFile(null);
      setCoverPhotoFile(null);
      setCoverPhotoPreview(null);
      setIsEditing(false);
      await fetchUser();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Add this function to handle username validation
const validateUsername = (username: string) => {
  if (!username) return { valid: true, message: "" }; // Allow empty username
  
  const minLength = 3;
  const maxLength = 20;
  const regex = /^[a-zA-Z0-9_]+$/; // Only letters, numbers, and underscores
  
  if (username.length < minLength) {
    return { valid: false, message: `Username must be at least ${minLength} characters` };
  }
  
  if (username.length > maxLength) {
    return { valid: false, message: `Username must be less than ${maxLength} characters` };
  }
  
  if (!regex.test(username)) {
    return { valid: false, message: "Username can only contain letters, numbers, and underscores" };
  }
  
  return { valid: true, message: "" };
};

    // Add username validation state
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);

    // Add this useEffect to validate username in real-time
    useEffect(() => {
      if (!user?.username) {
        setUsernameError(null);
        return;
      }

      const validation = validateUsername(user.username);
      setUsernameError(validation.valid ? null : validation.message);
    }, [user?.username]);

    // Add this function to check if username is available
    const checkUsernameAvailability = async (username: string) => {
      if (!username || username.length < 3) return true; // Skip check for short usernames
      
      try {
        setIsCheckingUsername(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/auth/check-username?username=${encodeURIComponent(username)}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          return data.available;
        }
        return true; // If API fails, assume it's available
      } catch (error) {
        console.error("Error checking username:", error);
        return true;
      } finally {
        setIsCheckingUsername(false);
      }
    };

  // Add this component inside your ProfilePage component, before the return statement
  const CoverPhotoEditor = () => {
    if (!showCoverPhotoEditor || !coverPhotoPreview) return null;

    const handlePositionChange = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setCoverPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    };

    const handleSavePosition = () => {
      setShowCoverPhotoEditor(false);
    };

    const handleCancel = () => {
      setShowCoverPhotoEditor(false);
      setCoverPhotoPreview(null);
      setCoverPhotoFile(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg p-6 max-w-2xl w-full mx-4">
          <h3 className="text-xl font-bold mb-4">Adjust Cover Photo</h3>
          <p className="text-gray-600 mb-4">Click on the image to set the visible area</p>
          
          <div 
            className="relative h-64 w-full bg-gray-200 rounded-lg overflow-hidden cursor-crosshair"
            onClick={handlePositionChange}
          >
            <img 
              src={coverPhotoPreview} 
              alt="Cover preview" 
              className="w-full h-full object-cover"
              style={{
                objectPosition: `${coverPosition.x}% ${coverPosition.y}%`
              }}
            />
            <div 
              className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg"
              style={{
                left: `${coverPosition.x}%`,
                top: `${coverPosition.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePosition}
              className="px-4 py-2 bg-redCustom text-white rounded-lg hover:bg-red-700"
            >
              Save Position
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Replace your current cover photo file input handler
  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPhotoFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setCoverPhotoPreview(previewUrl);
      
      // Show editor modal
      setShowCoverPhotoEditor(true);
      setCoverPosition({ x: 50, y: 50 }); // Reset to center
    }
  };

  // YouTube-inspired layout with banner
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)] relative">
      {/* Techy Background */}
      <TechyBackground variant="minimal" />
      
      {/* Content */}
      <div className="relative z-[10]">
        {/* Cover Photo Banner */}
      <div className="relative h-64 bg-gradient-to-r from-redCustom to-goldCustom">
        {(coverPhotoPreview || user.coverPhoto?.url) ? (
          <div className="w-full h-full overflow-hidden">
            <img 
              src={coverPhotoPreview || user.coverPhoto?.url} 
              alt="Cover" 
              className="w-full h-full object-cover"
              style={{
                objectPosition: coverPhotoPreview 
                  ? `${coverPosition.x}% ${coverPosition.y}%`
                  : `${user.coverPhoto?.position?.x || 50}% ${user.coverPhoto?.position?.y || 50}%`
              }}
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-red-600 to-yellow-500" />
        )}
        
        {isEditing && (
          <div className="absolute top-4 right-4 flex gap-2">
            {coverPhotoPreview && (
              <button
                onClick={() => setShowCoverPhotoEditor(true)}
                className="bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg cursor-pointer hover:bg-opacity-70"
              >
                Adjust Position
              </button>
            )}
            <label className="bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg cursor-pointer hover:bg-opacity-70">
              <FaCamera className="inline mr-2" />
              {user.coverPhoto?.url ? 'Change Cover' : 'Add Cover'}
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverPhotoChange}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Profile Picture Overlay */}
        <div className="absolute -bottom-16 left-8">
          <div className="relative">
            <img
              src={user.profilePicture?.url || "/default-avatar.png"}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-white object-cover"
            />
            {isEditing && (
              <label className="absolute bottom-2 right-2 bg-redCustom text-white p-2 rounded-full cursor-pointer hover:bg-red-700">
                <FaCamera />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePictureFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-8">
        {/* Header with Edit Toggle */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">@{user.username || user.email.split('@')[0]}</p>
            {user.bio && <p className="text-gray-700 dark:text-gray-300 mt-2 max-w-2xl">{user.bio}</p>}
          </div>
          
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 bg-redCustom text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <FaEdit />
            {isEditing ? "Cancel Editing" : "Edit Profile"}
          </button>
        </div>
        <div className="mb-12 text-right -mt-6 text-sm text-gray-500 italic">
            {!isEditing ? "Hit the edit button to update your profile details!" : "You are in edit mode. Make your changes and hit save."}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-[var(--bg-elevated)] p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-redCustom">{user.loginCount || 0}</div>
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Total Logins</div>
          </div>
          <div className="bg-white dark:bg-[var(--bg-elevated)] p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-redCustom">{user.streak?.current || 0}</div>
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Current Streak</div>
          </div>
          <div className="bg-white dark:bg-[var(--bg-elevated)] p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-redCustom">{user.streak?.longest || 0}</div>
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Longest Streak</div>
          </div>
          <div className="bg-white dark:bg-[var(--bg-elevated)] p-4 rounded-lg shadow text-center">
            <div className="text-lg sm:text-2xl font-bold text-redCustom break-words">
              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
            </div>
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Last Login</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {["basic", "professional", "social", "preferences"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? "border-redCustom text-redCustom"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Tab */}
          {activeTab === "basic" && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FaUser className="text-redCustom" />
                  Personal Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={user.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-redCustom focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FaEnvelope />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={user.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                    {isCheckingUsername && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-500">Checking availability...</span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={user.username || ""}
                    onChange={async (e) => {
                      const newUsername = e.target.value;
                      setUser((prev) => prev && { ...prev, username: newUsername });
                      
                      // Clear previous error
                      setUsernameError(null);
                      
                      // Validate format first
                      const validation = validateUsername(newUsername);
                      if (!validation.valid) {
                        setUsernameError(validation.message);
                        return;
                      }
                      
                      // Check availability only if format is valid and username is not empty
                      if (newUsername && newUsername.length >= 3) {
                        const isAvailable = await checkUsernameAvailability(newUsername);
                        if (!isAvailable) {
                          setUsernameError("Username is already taken");
                        }
                      }
                    }}
                    disabled={!isEditing}
                    className={`w-full border rounded-lg px-3 py-2 ${
                      usernameError 
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                        : "border-gray-300 focus:ring-redCustom focus:border-transparent"
                    }`}
                    placeholder="Choose a username"
                  />
                  {usernameError && (
                    <p className="mt-1 text-sm text-red-600">{usernameError}</p>
                  )}
                  {!usernameError && user.username && isEditing && (
                    <p className="mt-1 text-sm text-green-600">Username is available!</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FaCalendar />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formatDateForInput(user.dateOfBirth)}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FaHeart />
                    Marital Status
                  </label>
                  <select
                    name="maritalStatus"
                    value={user.maritalStatus || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FaMapMarkerAlt className="text-redCustom" />
                  Contact Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FaPhone />
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={user.phoneNumber || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Technical Unit</label>
                  <input
                    type="text"
                    name="technicalUnit"
                    value={user.technicalUnit || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={user.bio || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FaCode />
                    Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    value={user.skills?.join(", ") || ""}
                    onChange={(e) => {
                      setUser(prev => prev && { 
                        ...prev, 
                        skills: e.target.value.split(',').map(s => s.trim()) 
                      });
                    }}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="JavaScript, React, Node.js"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Professional Tab */}
          {activeTab === "professional" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                    <FaBriefcase />
                    Occupation
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    value={user.occupation || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                    <FaBuilding />
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={user.company || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-200"
                  />
                </div>
              </div>

              {/* Education Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaGraduationCap className="text-redCustom" />
                  Education
                </h3>
                <p className="text-gray-600 mb-4">List your educational background</p>
                
                {education.map((edu, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                        <input
                          type="text"
                          value={edu.institution || ""}
                          onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                          disabled={!isEditing}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="University Name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                        <input
                          type="text"
                          value={edu.degree || ""}
                          onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                          disabled={!isEditing}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="Bachelor's Degree"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                        <input
                          type="text"
                          value={edu.fieldOfStudy || ""}
                          onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)}
                          disabled={!isEditing}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="Computer Science"
                        />
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
                          <input
                            type="number"
                            value={edu.startYear || new Date().getFullYear()}
                            onChange={(e) => handleEducationChange(index, 'startYear', parseInt(e.target.value))}
                            disabled={!isEditing}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            min="1900"
                            max={new Date().getFullYear()}
                          />
                        </div>
                        
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Year</label>
                          <input
                            type="number"
                            value={edu.endYear || new Date().getFullYear()}
                            onChange={(e) => handleEducationChange(index, 'endYear', parseInt(e.target.value))}
                            disabled={!isEditing || edu.current}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            min="1900"
                            max={new Date().getFullYear()}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={edu.current || false}
                          onChange={(e) => {
                            handleEducationChange(index, 'current', e.target.checked);
                            if (e.target.checked) {
                              handleEducationChange(index, 'endYear', new Date().getFullYear());
                            }
                          }}
                          disabled={!isEditing}
                          className="rounded border-gray-300 text-redCustom focus:ring-redCustom"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Currently studying here</span>
                      </label>
                      
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeEducation(index)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {isEditing && (
                  <button
                    type="button"
                    onClick={addEducation}
                    className="flex items-center gap-2 text-redCustom hover:text-red-700 font-medium"
                  >
                    <FaPlus className="text-sm" />
                    Add Education
                  </button>
                )}
              </div>

              {/* Address Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-redCustom" />
                  Address
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Street"
                    value={user.address?.street || ""}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    disabled={!isEditing}
                    className="border border-gray-300 rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={user.address?.city || ""}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    disabled={!isEditing}
                    className="border border-gray-300 rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={user.address?.state || ""}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    disabled={!isEditing}
                    className="border border-gray-300 rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={user.address?.country || ""}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                    disabled={!isEditing}
                    className="border border-gray-300 rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={user.address?.zipCode || ""}
                    onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                    disabled={!isEditing}
                    className="border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Social Links Tab */}
          {activeTab === "social" && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FaGlobe className="text-redCustom" />
                  Social Links
                </h3>
                
                {[
                  { icon: FaLink, platform: 'website', label: 'Website' },
                  { icon: FaGithub, platform: 'github', label: 'GitHub' },
                  { icon: FaLinkedin, platform: 'linkedin', label: 'LinkedIn' },
                  { icon: FaXTwitter, platform: 'x', label: 'X' },
                ].map(({ icon: Icon, platform, label }) => (
                  <div key={platform}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Icon />
                      {label}
                    </label>
                    <input
                      type="url"
                      value={user.socialLinks?.[platform] || ""}
                      onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                      disabled={!isEditing}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder={`https://${platform}.com/username`}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-10">
                {[
                  { icon: FaInstagram, platform: 'instagram', label: 'Instagram' },
                  { icon: FaFacebook, platform: 'facebook', label: 'Facebook' },
                ].map(({ icon: Icon, platform, label }) => (
                  <div key={platform}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Icon />
                      {label}
                    </label>
                    <input
                      type="url"
                      value={user.socialLinks?.[platform] || ""}
                      onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                      disabled={!isEditing}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder={`https://${platform}.com/username`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div className="space-y-8 max-w-2xl mx-auto">
              {/* Onboarding Settings */}
              <div className="bg-white dark:bg-[var(--bg-elevated)] dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Onboarding & Hints
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Show Onboarding Tours</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Display helpful hints when visiting new pages
                      </p>
                    </div>
                    <button
                      onClick={() => handlePreferenceUpdate("onboardingEnabled", !onboardingEnabled)}
                      disabled={preferencesLoading}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        onboardingEnabled ? "bg-redCustom" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          onboardingEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                  {!onboardingEnabled && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        💡 Tip: You can re-enable onboarding tours anytime to get helpful hints while navigating the platform.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Password Settings */}
              <div className="bg-white dark:bg-[var(--bg-elevated)] dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Change Password
                  </h3>
                  <a
                    href="/forgot-password"
                    className="text-sm text-redCustom dark:text-[var(--lfc-red)] hover:text-goldCustom dark:hover:text-[var(--lfc-gold)] transition-colors"
                  >
                    Forgot Password?
                  </a>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[var(--bg-elevated)] dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter your current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setShowPasswordCriteria(true);
                      }}
                      onFocus={() => setShowPasswordCriteria(true)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[var(--bg-elevated)] dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter new password"
                    />
                  </div>

                  {/* Password Criteria */}
                  {showPasswordCriteria && newPassword && (
                    <div className="p-3 bg-gray-50 dark:bg-[var(--bg-tertiary)] rounded-lg border border-gray-200 dark:border-[var(--border-primary)] animate-in slide-in-from-top-2 duration-300">
                      <p className="text-xs font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">
                        Password Requirements:
                      </p>
                      <div className="space-y-1">
                        <PasswordCriteriaItem 
                          met={passwordCriteria.minLength} 
                          text="At least 8 characters" 
                        />
                        <PasswordCriteriaItem 
                          met={passwordCriteria.hasUpperCase} 
                          text="One uppercase letter" 
                        />
                        <PasswordCriteriaItem 
                          met={passwordCriteria.hasNumber} 
                          text="One number" 
                        />
                        <PasswordCriteriaItem 
                          met={passwordCriteria.hasSpecialChar} 
                          text="One special character (!@#$%^&*)" 
                        />
                      </div>
                    </div>
                  )}

                  {/* Confirm Password - Only show after all criteria are met */}
                  {allCriteriaMet && (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-[var(--bg-elevated)] dark:bg-gray-700 text-gray-900 dark:text-white ${
                          confirmPassword && !passwordsMatch
                            ? 'border-red-500 dark:border-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="Confirm new password"
                      />
                      {confirmPassword && !passwordsMatch && (
                        <p className="text-red-500 text-xs mt-1 animate-in fade-in duration-200">
                          Passwords do not match
                        </p>
                      )}
                      {confirmPassword && passwordsMatch && (
                        <p className="text-green-500 dark:text-[var(--success)] text-xs mt-1 animate-in fade-in duration-200 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Passwords match
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handlePasswordChange}
                    disabled={passwordLoading}
                    className="w-full bg-redCustom text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </button>

                  {passwordMessage && (
                    <p
                      className={`text-sm mt-2 ${
                        passwordMessage.includes("success")
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {passwordMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {isEditing && (
            <div className="flex justify-end pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-redCustom text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <FaSave />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </form>
      </div>
    {/* Cover Photo Editor Modal */}
    <CoverPhotoEditor />
      </div>
    </div>
  );
};

function PasswordCriteriaItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center text-xs transition-all duration-300 ${
      met ? 'text-green-600 dark:text-[var(--success)]' : 'text-gray-500 dark:text-[var(--text-muted)]'
    }`}>
      <div className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center transition-all duration-300 ${
        met ? 'bg-green-500 dark:bg-[var(--success)] scale-100' : 'bg-gray-300 dark:bg-gray-600 scale-90'
      }`}>
        {met && (
          <svg className="w-3 h-3 text-white animate-in zoom-in duration-200" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <span className={met ? 'font-medium' : ''}>{text}</span>
    </div>
  );
}

export default ProfilePage;