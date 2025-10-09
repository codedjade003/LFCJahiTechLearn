import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaTrash } from "react-icons/fa";

export interface Material {
  name: string;
  url: string;
  type: string;
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
    setUploading(true);

    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch(`${API_BASE}/api/uploads/material`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");

        const uploaded: {
          secure_url: string;
          original_filename: string;
          resource_type: string;
        } = await res.json();

        setMaterials((prev) => [
          ...prev,
          {
            name: uploaded.original_filename,
            url: uploaded.secure_url,
            type: uploaded.resource_type,
          },
        ]);
      } catch (err) {
        console.error("❌ Upload error:", err);
      }
    }

    setUploading(false);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
      >
        <input {...getInputProps()} />
        {uploading ? "Uploading..." : "Drag & drop files here or click to upload"}
      </div>

      <div className="space-y-2">
        {materials.map((m, i) => (
          <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm">{m.name}</span>
            <button
              type="button"
              onClick={() => setMaterials(materials.filter((_, idx) => idx !== i))}
              className="text-red-600 hover:text-red-800"
            >
              <FaTrash size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
