import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaTrash } from "react-icons/fa";

export interface Material {
  name: string;
  url: string;
  type: string;
  public_id?: string;
}

interface MaterialsUploaderProps {
  materials: Material[];
  setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
}

export default function MaterialsUploader({ materials, setMaterials }: MaterialsUploaderProps) {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [uploading, setUploading] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    setUploading(true);

    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        // Use the unified upload endpoint with 'document' type
        const res = await fetch(`${API_BASE}/api/uploads/document`, {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${token}`,
            // Don't set Content-Type for FormData - let browser set it
          },
          body: formData,
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Upload failed: ${res.status} ${errorText}`);
        }

        const uploaded = await res.json();
        
        if (uploaded.success) {
          setMaterials((prev) => [
            ...prev,
            {
              name: uploaded.original_filename || file.name,
              url: uploaded.secure_url || uploaded.url,
              type: uploaded.resource_type || getFileType(file.type),
              public_id: uploaded.public_id
            },
          ]);
        } else {
          throw new Error(uploaded.message || "Upload failed");
        }
      } catch (err) {
        console.error("❌ Upload error:", err);
        alert(`Failed to upload ${file.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    setUploading(false);
  };

  // Helper function to determine file type
  const getFileType = (mimetype: string): string => {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.includes('pdf')) return 'pdf';
    if (mimetype.includes('document') || mimetype.includes('sheet')) return 'document';
    return 'raw';
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    multiple: true 
  });

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <svg className="w-8 h-8 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-gray-600">
            {uploading ? "Uploading..." : "Drag & drop files here or click to upload"}
          </p>
          <p className="text-xs text-gray-500">
            Supports images, videos, PDFs, documents, and more
          </p>
        </div>
      </div>

      {/* Uploaded Files List */}
      {materials.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
          {materials.map((material, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-[var(--bg-elevated)] border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded ${
                  material.type === 'image' ? 'bg-blue-100 text-blue-600' :
                  material.type === 'video' ? 'bg-purple-100 text-purple-600' :
                  material.type === 'pdf' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {material.type === 'image' && '🖼️'}
                  {material.type === 'video' && '🎬'}
                  {material.type === 'pdf' && '📄'}
                  {!['image', 'video', 'pdf'].includes(material.type) && '📎'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                    {material.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{material.type}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeMaterial(index)}
                className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                title="Remove file"
              >
                <FaTrash size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}