// src/components/Admin/EditCourseTabs/EditCourseInfoTab.tsx
import { useState, useEffect, useRef } from "react";
import { FaSave } from "react-icons/fa";

interface EditCourseInfoTabProps {
  course: any;
  onCourseUpdated: (id: string) => void;
  onBack: () => void;
}

export default function EditCourseInfoTab({ course, onCourseUpdated, onBack }: EditCourseInfoTabProps) {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Update the resolveImageUrl function to handle video files
  function resolveImageUrl(url?: string) {
    if (!url) return "";
    // Handle absolute URLs
    if (url.startsWith("http")) return url;
    
    // Handle files that might be in uploads directory
    if (url.includes('/') && !url.startsWith('/')) {
      return `${API_BASE}/${url}`;
    }
    
    // Handle relative paths - assume videos are in uploads/videos/
    if (url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.avi')) {
      return `${API_BASE}/uploads/${url}`;
    }
    
    // Handle relative paths for images
    return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
  }

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "Video",
    level: "beginner",
    instructorName: "",
    instructorAvatar: "",
    instructorAvatarFile: null as File | null,
    thumbnail: "",
    thumbnailFile: null as File | null,
    promoVideo: "",
    promoVideoFile: null as File | null,
    category: "",
  });

// Replace your categories state with a fixed array
  const categories = [
    "Video",
    "Audio",
    "Graphics",
    "Required",
    "Content Creation",
    "Utility",
    "Secretariat",
  ];
  const [activeAvatarTab, setActiveAvatarTab] = useState<'file' | 'url'>('file');
  const [activeThumbnailTab, setActiveThumbnailTab] = useState<'file' | 'url'>('file');
  const [activeVideoTab, setActiveVideoTab] = useState<'file' | 'url'>('file');
  const [saving, setSaving] = useState(false);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(true);
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [thumbnailUrlInput, setThumbnailUrlInput] = useState('');
  const [promoVideoUrlInput, setPromoVideoUrlInput] = useState('');

  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);
  const [promoVideo, setPromoVideo] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [instructorAvatar, setInstructorAvatar] = useState<File | null>(null);

  // Initialize form data when course prop changes - FIXED: Added proper dependency array
  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || "",
        description: course.description || "",
        type: course.type || "Video",
        level: course.level || "beginner",
        instructorName: course.instructor?.name || "",
        instructorAvatar: course.instructor?.avatar || "",
        instructorAvatarFile: null,
        thumbnail: course.thumbnail || "",
        thumbnailFile: null,
        promoVideo: course.promoVideo || "",
        promoVideoFile: null,
        category: course.categories?.[0] || "",
      });

      // Also sync the URL inputs + active tabs
      setAvatarUrlInput(course.instructor?.avatar || "");
      setThumbnailUrlInput(course.thumbnail || "");
      setPromoVideoUrlInput(course.promoVideo || "");

      setActiveAvatarTab(course.instructor?.avatar ? "url" : "file");
      setActiveThumbnailTab(course.thumbnail ? "url" : "file");
      setActiveVideoTab(course.promoVideo ? "url" : "file");
    }
  }, [course]); // Only re-run when course changes

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPromoVideo(file);
      handleFileChange("promoVideoFile", file);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnail(file);
      handleFileChange("thumbnailFile", file);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setInstructorAvatar(file);
      handleFileChange("instructorAvatarFile", file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-lfc-gold", "bg-blue-50");
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-lfc-gold", "bg-blue-50");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, field: string, fileType: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-lfc-gold", "bg-blue-50");
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith(`${fileType}/`)) {
      const file = files[0];
      if (field === "promoVideoFile") {
        setPromoVideo(file);
      } else if (field === "thumbnailFile") {
        setThumbnail(file);
      } else if (field === "instructorAvatarFile") {
        setInstructorAvatar(file);
      }
      handleFileChange(field, file);
    }
  };

  const uploadFile = async (file: File, fileType: string): Promise<string> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/api/courses/upload/${fileType}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Upload failed: ${res.status} ${errorText}`);
    }
    
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in");
      setSaving(false);
      return;
    }

    try {
      let uploadedThumb = formData.thumbnail;
      let uploadedVideo = formData.promoVideo;
      let uploadedAvatar = formData.instructorAvatar;

      // Upload thumbnail if file is selected
      if (activeThumbnailTab === "file" && formData.thumbnailFile) {
        uploadedThumb = await uploadFile(formData.thumbnailFile, "image");
      } else if (activeThumbnailTab === "url" && thumbnailUrlInput) {
        uploadedThumb = thumbnailUrlInput;
      }

      // Upload video if file is selected
      if (activeVideoTab === "file" && formData.promoVideoFile) {
        uploadedVideo = await uploadFile(formData.promoVideoFile, "video");
      } else if (activeVideoTab === "url" && promoVideoUrlInput) {
        uploadedVideo = promoVideoUrlInput;
      }

      // Upload avatar if file is selected
      if (activeAvatarTab === "file" && formData.instructorAvatarFile) {
        uploadedAvatar = await uploadFile(formData.instructorAvatarFile, "image");
      } else if (activeAvatarTab === "url" && avatarUrlInput) {
        uploadedAvatar = avatarUrlInput;
      }

      const courseData = {
        title: formData.title,
        description: formData.description,
        categories: formData.category ? [formData.category] : [],
        level: formData.level,
        type: formData.type,
        thumbnail: uploadedThumb,
        promoVideo: uploadedVideo,
        instructor: {
          name: formData.instructorName,
          avatar: uploadedAvatar,
        },
      };

      console.log("Updating course with data:", courseData);

      const res = await fetch(`${API_BASE}/api/courses/${course._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(courseData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to update course: ${res.status} ${errorText}`);
      }
      
      const data = await res.json();
      console.log("Course updated successfully:", data);
      
      onCourseUpdated(data._id);
      alert("Course updated successfully!");
    } catch (err: any) {
      console.error("Update error:", err);
      alert(`Update failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
      {/* Left Column - Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <h3 className="text-lg font-medium text-yt-text-dark mb-1">Basic Information</h3>
          <p className="text-sm text-yt-text-gray">
            Edit details like title, description, category, and type.
          </p>

          {/* Title */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-yt-text-dark mb-2">Title</label>
            <input
              type="text"
              name="title"
              className="w-full border border-yt-light-border rounded-md px-3 py-2.5 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm md:text-base"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Enter course title"
            />
          </div>

          {/* Description */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-yt-text-dark mb-2">Description</label>
            <textarea
              name="description"
              rows={4}
              className="w-full border border-yt-light-border rounded-md px-3 py-2.5 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm md:text-base"
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="Describe what students will learn in this course"
            />
          </div>

          {/* Instructor Name */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-yt-text-dark mb-2">Instructor Name</label>
            <input
              type="text"
              name="instructorName"
              className="w-full border border-yt-light-border rounded-md px-3 py-2.5 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm md:text-base"
              value={formData.instructorName}
              onChange={handleInputChange}
              placeholder="Enter instructor's name"
            />
          </div>

          {/* Instructor Avatar Upload */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-yt-text-dark mb-2">Instructor Avatar</label>
            <div className="flex border-b border-yt-light-border mb-3">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium ${activeAvatarTab === 'file' ? 'border-b-2 border-lfc-red text-lfc-red' : 'text-yt-text-gray'}`}
                onClick={() => setActiveAvatarTab('file')}
              >
                Upload File
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium ${activeAvatarTab === 'url' ? 'border-b-2 border-lfc-red text-lfc-red' : 'text-yt-text-gray'}`}
                onClick={() => setActiveAvatarTab('url')}
              >
                Use URL
              </button>
            </div>

            {activeAvatarTab === 'file' ? (
              <div 
                className="relative flex items-center justify-center w-full h-28 border-2 border-dashed border-yt-light-border rounded-lg cursor-pointer hover:bg-yt-light-hover hover:border-lfc-gold transition-colors group"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "instructorAvatarFile", "image")}
                onClick={() => avatarFileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-6 h-6 mb-2 text-yt-text-gray group-hover:text-lfc-gold transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-1 text-xs text-yt-text-gray"><span className="font-semibold">Click to upload or drag and drop</span></p>
                  <p className="text-xs text-yt-text-gray">PNG, JPG (MAX. 2MB)</p>
                </div>
                <input 
                  ref={avatarFileInputRef}
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <svg
                className="w-8 h-8 text-lfc-gold animate-bounce"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6h.1a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
                </svg>

                </div>
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  className="w-full border border-yt-light-border rounded-md px-3 py-2 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm"
                  placeholder="Enter avatar image URL"
                  value={avatarUrlInput}
                  onChange={(e) => setAvatarUrlInput(e.target.value)}
                />
              </div>
            )}
            {instructorAvatar && (
              <p className="text-xs text-yt-text-gray mt-2">Selected: {instructorAvatar.name}</p>
            )}
          </div>

          {/* Category and Type */}
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium">Category</label>
              <select
                name="category"
                className="w-full border border-yt-light-border rounded-md px-3 py-2.5 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm md:text-base"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Select a Category --</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Level */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-yt-text-dark mb-2">Level</label>
            <select
              name="level"
              className="w-full border border-yt-light-border rounded-md px-3 py-2.5 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm md:text-base"
              value={formData.level}
              onChange={handleInputChange}
              required
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Thumbnail Upload */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-yt-text-dark mb-2">Thumbnail</label>
            <div className="flex border-b border-yt-light-border mb-3">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium ${activeThumbnailTab === 'file' ? 'border-b-2 border-lfc-red text-lfc-red' : 'text-yt-text-gray'}`}
                onClick={() => setActiveThumbnailTab('file')}
              >
                Upload File
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium ${activeThumbnailTab === 'url' ? 'border-b-2 border-lfc-red text-lfc-red' : 'text-yt-text-gray'}`}
                onClick={() => setActiveThumbnailTab('url')}
              >
                Use URL
              </button>
            </div>

            {activeThumbnailTab === 'file' ? (
              <div 
                className="relative flex items-center justify-center w-full h-28 border-2 border-dashed border-yt-light-border rounded-lg cursor-pointer hover:bg-yt-light-hover hover:border-lfc-gold transition-colors group"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "thumbnailFile", "image")}
                onClick={() => thumbnailFileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-6 h-6 mb-2 text-yt-text-gray group-hover:text-lfc-gold transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-1 text-xs text-yt-text-gray"><span className="font-semibold">Click to upload or drag and drop</span></p>
                  <p className="text-xs text-yt-text-gray">PNG, JPG, GIF (MAX. 5MB)</p>
                </div>
                <input 
                  ref={thumbnailFileInputRef}
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleThumbnailChange}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-8 h-8 text-lfc-gold animate-bounce" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  className="w-full border border-yt-light-border rounded-md px-3 py-2 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm"
                  placeholder="Enter thumbnail image URL"
                  value={thumbnailUrlInput}
                  onChange={(e) => setThumbnailUrlInput(e.target.value)}
                />
              </div>
            )}
            {thumbnail && (
              <p className="text-xs text-yt-text-gray mt-2">Selected: {thumbnail.name}</p>
            )}
          </div>

          {/* Promo Video Upload */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-yt-text-dark mb-2">Promo Video</label>
            <div className="flex border-b border-yt-light-border mb-3">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium ${activeVideoTab === 'file' ? 'border-b-2 border-lfc-red text-lfc-red' : 'text-yt-text-gray'}`}
                onClick={() => setActiveVideoTab('file')}
              >
                Upload File
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium ${activeVideoTab === 'url' ? 'border-b-2 border-lfc-red text-lfc-red' : 'text-yt-text-gray'}`}
                onClick={() => setActiveVideoTab('url')}
              >
                Use URL
              </button>
            </div>

            {activeVideoTab === 'file' ? (
              <div 
                className="relative flex items-center justify-center w-full h-28 border-2 border-dashed border-yt-light-border rounded-lg cursor-pointer hover:bg-yt-light-hover hover:border-lfc-gold transition-colors group"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('border-lfc-gold', 'bg-blue-50');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-lfc-gold', 'bg-blue-50');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-lfc-gold', 'bg-blue-50');
                  const files = e.dataTransfer.files;
                  if (files.length > 0 && files[0].type.startsWith('video/')) {
                    const file = files[0];
                    setPromoVideo(file);
                    handleFileChange("promoVideoFile", file);
                  }
                }}
                onClick={() => document.getElementById('video-upload')?.click()}
              >
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-6 h-6 mb-2 text-yt-text-gray group-hover:text-lfc-gold transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                  <p className="mb-1 text-xs text-yt-text-gray"><span className="font-semibold">Click to upload or drag and drop</span></p>
                  <p className="text-xs text-yt-text-gray">MP4, MOV (MAX. 100MB)</p>
                </div>
                <input 
                  id="video-upload"
                  type="file" 
                  className="hidden" 
                  accept="video/*"
                  onChange={handleVideoChange}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-8 h-8 text-lfc-gold animate-bounce" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  className="w-full border border-yt-light-border rounded-md px-3 py-2 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm"
                  placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                  value={promoVideoUrlInput}
                  onChange={(e) => setPromoVideoUrlInput(e.target.value)}
                />
                {promoVideoUrlInput && !promoVideoUrlInput.includes('youtube') && !promoVideoUrlInput.includes('vimeo') ? (
                  <div className="mt-3 aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      src={resolveImageUrl(promoVideoUrlInput)}
                      controls
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        console.error("Failed to load video from URL:", promoVideoUrlInput);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ) : promoVideoUrlInput ? (
                  <div className="mt-3 aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      src={promoVideoUrlInput.replace('watch?v=', 'embed/').replace('vimeo.com/', 'player.vimeo.com/video/')}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : null}
              </div>
            )}
            {promoVideo && (
              <p className="text-xs text-yt-text-gray mt-2">Selected: {promoVideo.name}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 mt-6">
            <button
              type="submit"
              disabled={saving}
              className="bg-lfc-red text-white px-4 py-2.5 rounded-md hover:bg-lfc-gold-dark disabled:opacity-50 font-medium text-sm md:text-base flex items-center"
            >
              <FaSave className="inline mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2.5 border border-yt-light-border rounded-md text-yt-text-dark hover:bg-yt-light-hover font-medium text-sm md:text-base"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Right Column - Preview */}
      <div className="lg:hidden">
        <button 
          onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
          className="w-full bg-yt-light-hover p-3 rounded-lg flex items-center justify-between font-medium text-yt-text-dark"
        >
          <span>Preview</span>
          <svg 
            className={`w-5 h-5 transform transition-transform ${isPreviewExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>
      
      <div className={`${isPreviewExpanded ? 'block' : 'hidden'} lg:block bg-white p-4 md:p-5 rounded-lg border border-yt-light-border shadow-sm`}>
        <h3 className="text-lg font-medium text-yt-text-dark mb-4">Preview</h3>
        
        {/* Instructor Preview */}
        {(formData.instructorName || instructorAvatar || avatarUrlInput) && (
        <div className="mb-4 md:mb-6">
            <h4 className="text-sm font-medium text-yt-text-dark mb-2">Instructor</h4>
            <div className="flex items-center p-3 bg-yt-light-hover rounded-lg">
            {activeAvatarTab === 'file' && instructorAvatar ? (
                <img
                src={URL.createObjectURL(instructorAvatar)}
                alt="Instructor avatar"
                className="w-12 h-12 rounded-full object-cover mr-3"
                />
            ) : activeAvatarTab === 'url' && avatarUrlInput ? (
                <img
                src={resolveImageUrl(avatarUrlInput)}
                alt="Instructor avatar"
                className="w-12 h-12 rounded-full object-cover mr-3"
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                }}
                />
            ) : (
                <div className="w-12 h-12 rounded-full bg-lfc-gold flex items-center justify-center mr-3">
                <span className="text-white font-medium text-lg">
                    {formData.instructorName ? formData.instructorName.charAt(0).toUpperCase() : '?'}
                </span>
                </div>
            )}
            <span className="text-sm font-medium">{formData.instructorName || "Unknown Instructor"}</span>
            </div>
        </div>
        )}
        
        {/* Promo Video Preview */}
        <div className="mb-4 md:mb-6">
          <h4 className="text-sm font-medium text-yt-text-dark mb-2">Promo Video</h4>
          <div className="w-full h-40 md:h-48 bg-yt-light-hover rounded-lg flex items-center justify-center overflow-hidden">
            {promoVideo ? (
              // Newly uploaded file preview
              <video
                src={URL.createObjectURL(promoVideo)}
                controls
                className="w-full h-full object-contain"
              />
            ) : promoVideoUrlInput ? (
              // URL input preview (external services)
              promoVideoUrlInput.includes('youtube') || promoVideoUrlInput.includes('vimeo') ? (
                <div className="aspect-video w-full bg-black">
                  <iframe
                    src={promoVideoUrlInput.replace('watch?v=', 'embed/').replace('vimeo.com/', 'player.vimeo.com/video/')}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                // URL input preview (backend-stored files)
                <video
                  src={resolveImageUrl(promoVideoUrlInput)}
                  controls
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error("Failed to load video from URL input:", promoVideoUrlInput);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )
            ) : formData.promoVideo ? (
              // Existing course video from backend
              formData.promoVideo.includes('youtube') || formData.promoVideo.includes('vimeo') ? (
                <div className="aspect-video w-full bg-black">
                  <iframe
                    src={formData.promoVideo.replace('watch?v=', 'embed/').replace('vimeo.com/', 'player.vimeo.com/video/')}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                // Backend-stored video file
                <video
                  src={resolveImageUrl(formData.promoVideo)}
                  controls
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error("Failed to load existing video:", formData.promoVideo);
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.video-fallback') as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              )
            ) : (
              // Fallback when no video
              <div className="text-center text-yt-text-gray p-4 video-fallback">
                <svg className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                <p className="text-xs md:text-sm">No video uploaded</p>
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail Preview */}
        <div className="mb-4 md:mb-6">
        <h4 className="text-sm font-medium text-yt-text-dark mb-2">Thumbnail</h4>
        <div className="w-full h-40 md:h-48 bg-yt-light-hover rounded-lg flex items-center justify-center overflow-hidden">
            {/* Show uploaded file preview (highest priority) */}
            {thumbnail ? (
            <img
                src={URL.createObjectURL(thumbnail)}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
                key="file-preview"
            />
            ) : null}
            
            {/* Show URL input preview (second priority) */}
            {!thumbnail && thumbnailUrlInput ? (
            <img
                src={resolveImageUrl(thumbnailUrlInput)}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
                key="url-input-preview"
                onError={(e) => {
                console.error("Failed to load URL image:", thumbnailUrlInput);
                e.currentTarget.style.display = 'none';
                }}
                onLoad={(e) => {
                console.log("Successfully loaded URL image:", thumbnailUrlInput);
                e.currentTarget.style.display = 'block';
                }}
            />
            ) : null}
            
            {/* Show existing course thumbnail (third priority) */}
            {!thumbnail && !thumbnailUrlInput && formData.thumbnail ? (
            <img
                src={resolveImageUrl(formData.thumbnail)}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
                key="existing-thumbnail-preview"
                onError={(e) => {
                console.error("Failed to load existing thumbnail:", formData.thumbnail);
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('.thumbnail-fallback') as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
                }}
                onLoad={(e) => {
                console.log("Successfully loaded existing thumbnail:", formData.thumbnail);
                e.currentTarget.style.display = 'block';
                const fallback = e.currentTarget.parentElement?.querySelector('.thumbnail-fallback') as HTMLElement;
                if (fallback) fallback.style.display = 'none';
                }}
            />
            ) : null}
            
            {/* Fallback when no thumbnail is available or images fail to load */}
            <div 
            className="text-center text-yt-text-gray p-4 thumbnail-fallback" 
            style={{ 
                display: (!thumbnail && !thumbnailUrlInput && !formData.thumbnail) ? 'flex' : 'none' 
            }}
            >
            <svg className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 20m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <p className="text-xs md:text-sm">No thumbnail uploaded</p>
            </div>
        </div>
        </div>
        
        {/* Course Info Preview */}
        <div className="mt-4 md:mt-6 pt-4 border-t border-yt-light-border">
          <h4 className="text-sm font-medium text-yt-text-dark mb-2">Course Info Preview</h4>
          <div className="space-y-2">
            <p className="text-xs md:text-sm"><span className="font-medium">Title:</span> {formData.title || "No title set"}</p>
            <p className="text-xs md:text-sm"><span className="font-medium">Category:</span> {formData.category || "No type selected"}</p>
            <p className="text-xs md:text-sm"><span className="font-medium">Level:</span> {formData.level ? formData.level.charAt(0).toUpperCase() + formData.level.slice(1) : "Not set"}</p>
            <p className="text-xs md:text-sm"><span className="font-medium">Description:</span> {formData.description ? `${formData.description.substring(0, 80)}${formData.description.length > 80 ? '...' : ''}` : "No description provided"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}