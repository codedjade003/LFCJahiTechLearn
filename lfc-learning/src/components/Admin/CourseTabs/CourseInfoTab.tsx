// src/components/Admin/CourseTabs/CourseInfoTab.tsx
import { useState, useEffect } from "react";

interface CourseInfoTabProps {
  onCourseCreated: (id: string) => void;
  courseId?: string | null; // Add this line
}

export default function CourseInfoTab({ courseId, onCourseCreated }: CourseInfoTabProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [type, setType] = useState("Video");
  const [instructorName, setInstructorName] = useState("");
  const [instructorAvatar, setInstructorAvatar] = useState<File | null>(null);
  const [instructorAvatarUrl, ] = useState(""); 
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);  
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [promoVideo, setPromoVideo] = useState<File | null>(null);
  const [thumbnailUrl, ] = useState("");
  const [promoVideoUrl, ] = useState("");
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeAvatarTab, setActiveAvatarTab] = useState<'file' | 'url'>('file');
  const [activeThumbnailTab, setActiveThumbnailTab] = useState<'file' | 'url'>('file');
  const [activeVideoTab, setActiveVideoTab] = useState<'file' | 'url'>('file');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [thumbnailUrlInput, setThumbnailUrlInput] = useState('');
  const [promoVideoUrlInput, setPromoVideoUrlInput] = useState('');

  useEffect(() => {
    if (courseId) {
      async function fetchCourseData() {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (res.ok) {
            const courseData = await res.json();
            // Populate form fields with existing course data
            setTitle(courseData.title || "");
            setDescription(courseData.description || "");
            setType(courseData.type || "Video");
            setLevel(courseData.level || "Beginner");
            setInstructorName(courseData.instructor?.name || "");
            setAvatarUrl(courseData.instructor?.avatar || "");
            setThumbnailUrlInput(courseData.thumbnail || "");
            setPromoVideoUrlInput(courseData.promoVideo || "");
            setSelectedCategories(courseData.categories || []);
          }
        } catch (err) {
          console.error("Failed to fetch course data", err);
        }
      }
      
      fetchCourseData();
    }
  }, [courseId]);

  const [level, setLevel] = useState("Beginner"); // Default to match schema
  const [levelOptions, setLevelOptions] = useState<string[]>(["Beginner", "Intermediate", "Advanced"]); // Default options

  useEffect(() => {
    async function fetchEnums() {
      try {
        const res = await fetch("http://localhost:5000/api/courses/enums");
        if (res.ok) {
          const data = await res.json();
          console.log("Enums API response:", data); // 👈 check this
          setLevelOptions(data.levels || []);
          setTypes(data.types || []); // fetch from enum, not categories API
        }
      } catch (err) {
        console.error("Failed to fetch enums", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEnums();
  }, []);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value);
    setSelectedCategories([e.target.value]); // Reset selected categories when type changes
  };

  const uploadFile = async (file: File, fileType: string): Promise<string> => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await fetch(`http://localhost:5000/api/courses/upload/${fileType}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (res.ok) {
        const data = await res.json();
        return data.url;
      } else {
        throw new Error("File upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

// Update the handleSubmit function to handle both CREATE and UPDATE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to save courses");
      setSaving(false);
      return;
    }

    try {
      // Handle file uploads or URLs (same as before)
      let uploadedThumb = thumbnailUrl;
      let uploadedVideo = promoVideoUrl;
      let uploadedAvatar = instructorAvatarUrl;

      if (activeThumbnailTab === 'file' && thumbnail) {
        uploadedThumb = await uploadFile(thumbnail, "image");
      }

      if (activeVideoTab === 'file' && promoVideo) {
        uploadedVideo = await uploadFile(promoVideo, "video");
      }

      if (activeAvatarTab === 'file' && instructorAvatar) {
        uploadedAvatar = await uploadFile(instructorAvatar, "image");
      }

      // Create course data object
      const courseData = {
        title,
        description,
        categories: selectedCategories,
        level,
        type,
        thumbnail: uploadedThumb,
        promoVideo: uploadedVideo,
        instructor: {
          name: instructorName,
          avatar: uploadedAvatar
        },
      };

      // Determine if we're creating or updating
      const url = courseId 
        ? `http://localhost:5000/api/courses/${courseId}` // UPDATE
        : "http://localhost:5000/api/courses"; // CREATE
      
      const method = courseId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(courseData),
      });

      if (res.ok) {
        const data = await res.json();
        if (!courseId) {
          onCourseCreated(data._id); // Only call this for new courses
        }
        alert(courseId ? "Course updated successfully!" : "Course saved successfully!");
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save course");
      }
    } catch (err) {
      console.error("Error saving course", err);
      alert(err instanceof Error ? err.message : "Failed to save course. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnail(e.target.files[0]);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPromoVideo(e.target.files[0]);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setInstructorAvatar(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
      {/* Left Column - Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <h3 className="text-lg font-medium text-yt-text-dark mb-1">Basic Information</h3>
          <p className="text-sm text-yt-text-gray">
            Add details like title, description, category, and type.
          </p>

          {/* Title */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-yt-text-dark mb-2">Title</label>
            <input
              type="text"
              className="w-full border border-yt-light-border rounded-md px-3 py-2.5 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm md:text-base"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter course title"
            />
          </div>

          {/* Description */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-yt-text-dark mb-2">Description</label>
            <textarea
              rows={4}
              className="w-full border border-yt-light-border rounded-md px-3 py-2.5 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm md:text-base"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Describe what students will learn in this course"
            />
          </div>

          {/* Instructor Name */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-yt-text-dark mb-2">Instructor Name</label>
            <input
              type="text"
              className="w-full border border-yt-light-border rounded-md px-3 py-2.5 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm md:text-base"
              value={instructorName}
              onChange={(e) => setInstructorName(e.target.value)}
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
                  if (files.length > 0 && files[0].type.startsWith('image/')) {
                    setInstructorAvatar(files[0]);
                  }
                }}
              >
                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-6 h-6 mb-2 text-yt-text-gray group-hover:text-lfc-gold transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-1 text-xs text-yt-text-gray"><span className="font-semibold">Click to upload or drag and drop</span></p>
                    <p className="text-xs text-yt-text-gray">PNG, JPG (MAX. 2MB)</p>
                  </div>
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>
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
                  placeholder="Enter avatar image URL"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>
            )}
            {instructorAvatar && (
              <p className="text-xs text-yt-text-gray mt-2">Selected: {instructorAvatar.name}</p>
            )}
          </div>

          {/* Category and Type */}
          <div>
            <label className="block text-sm font-medium">Category</label>
            <select
              className="w-full border rounded-md px-3 py-2 focus:ring-lfc-red focus:border-lfc-red text-sm md:text-base"
              value={type}
              onChange={handleTypeChange}
              required
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>


          {/* Level */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-yt-text-dark mb-2">Level</label>
            <select
              className="w-full border border-yt-light-border rounded-md px-3 py-2.5 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm md:text-base"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              required
            >
              {levelOptions.map((levelOption) => (
                <option key={levelOption} value={levelOption}>
                  {levelOption}
                </option>
              ))}
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
                  if (files.length > 0 && files[0].type.startsWith('image/')) {
                    setThumbnail(files[0]);
                  }
                }}
              >
                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-6 h-6 mb-2 text-yt-text-gray group-hover:text-lfc-gold transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-1 text-xs text-yt-text-gray"><span className="font-semibold">Click to upload or drag and drop</span></p>
                    <p className="text-xs text-yt-text-gray">PNG, JPG, GIF (MAX. 5MB)</p>
                  </div>
                  <input 
                    id="thumbnail-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleThumbnailChange}
                  />
                </label>
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
                    setPromoVideo(files[0]);
                  }
                }}
              >
                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
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
                </label>
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
                {promoVideoUrlInput && (
                  <div className="mt-3 aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      src={promoVideoUrlInput.replace('watch?v=', 'embed/').replace('vimeo.com/', 'player.vimeo.com/video/')}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            )}
            {promoVideo && (
              <p className="text-xs text-yt-text-gray mt-2">Selected: {promoVideo.name}</p>
            )}
          </div>

          {/* Submit */}
          <div className="mt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-lfc-red text-white px-4 py-2.5 rounded-md hover:bg-lfc-gold-dark disabled:opacity-50 font-medium text-sm md:text-base"
          >
            {saving ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 4 12z"/>
                </svg>
                {courseId ? "Updating..." : "Saving..."}
              </span>
            ) : courseId ? "Update Course" : "Save Course"}
          </button>
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
        {(instructorName || instructorAvatar || instructorAvatarUrl) && (
          <div className="mb-4 md:mb-6">
            <h4 className="text-sm font-medium text-yt-text-dark mb-2">Instructor</h4>
            <div className="flex items-center p-3 bg-yt-light-hover rounded-lg">
              {instructorAvatar ? (
                <img
                  src={URL.createObjectURL(instructorAvatar)}
                  alt="Instructor avatar"
                  className="w-12 h-12 rounded-full object-cover mr-3"
                />
              ) : instructorAvatarUrl ? (
                <img
                  src={instructorAvatarUrl}
                  alt="Instructor avatar"
                  className="w-12 h-12 rounded-full object-cover mr-3"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-lfc-gold flex items-center justify-center mr-3">
                  <span className="text-white font-medium text-lg">
                    {instructorName ? instructorName.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
              )}
              <span className="text-sm font-medium">{instructorName || "Unknown Instructor"}</span>
            </div>
          </div>
        )}
        
        {/* Promo Video Preview */}
        <div className="mb-4 md:mb-6">
          <h4 className="text-sm font-medium text-yt-text-dark mb-2">Promo Video</h4>
          <div className="w-full h-40 md:h-48 bg-yt-light-hover rounded-lg flex items-center justify-center overflow-hidden">
            {promoVideo ? (
              <video
                src={URL.createObjectURL(promoVideo)}
                controls
                className="w-full h-full object-contain"
              />
            ) : promoVideoUrlInput ? (
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
              <div className="text-center text-yt-text-gray p-4">
                {/* For video icon */}
                <svg className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
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
            {thumbnail ? (
              <img
                src={URL.createObjectURL(thumbnail)}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
              />
            ) : thumbnailUrlInput ? (
              <img
                src={thumbnailUrlInput}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  (e.currentTarget.parentElement!.querySelector('.thumbnail-fallback') as HTMLElement)!.style.display = 'flex';
                }}
              />
            ) : null}
            {(!thumbnail && !thumbnailUrlInput) && (
              <div className="text-center text-yt-text-gray p-4 thumbnail-fallback">
                <svg className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 20m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p className="text-xs md:text-sm">No thumbnail uploaded</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Course Info Preview */}
        <div className="mt-4 md:mt-6 pt-4 border-t border-yt-light-border">
          <h4 className="text-sm font-medium text-yt-text-dark mb-2">Course Info Preview</h4>
          <div className="space-y-2">
            <p className="text-xs md:text-sm"><span className="font-medium">Title:</span> {title || "No title set"}</p>
            <p className="text-xs md:text-sm"><span className="font-medium">Category:</span> {type || "No type selected"}</p>
            <p className="text-xs md:text-sm"><span className="font-medium">Level:</span> {level.charAt(0).toUpperCase() + level.slice(1) || "Not set"}</p>
            <p className="text-xs md:text-sm"><span className="font-medium">Description:</span> {description ? `${description.substring(0, 80)}${description.length > 80 ? '...' : ''}` : "No description provided"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}