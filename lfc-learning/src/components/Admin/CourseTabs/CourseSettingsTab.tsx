// src/pages/Admin/CourseSettingsTab.tsx
import { useState, useEffect } from "react";
import { FaSave } from "react-icons/fa";

interface CourseSettings {
  prerequisites: string[];
  objectives: string[];
  tags: string[];
  duration: string;
  estimatedDuration: {
    value: number;
    unit: 'days' | 'weeks' | 'months';
  };
  type: string;
}

interface CourseSettingsTabProps {
  courseId: string;
}

export default function CourseSettingsTab({ courseId }: CourseSettingsTabProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<CourseSettings>({
    prerequisites: [],
    objectives: [],
    tags: [],
    duration: "",
    estimatedDuration: { value: 0, unit: "days" },
    type: "Video",
  });

  const API_BASE = "http://localhost:5000";

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings({
          prerequisites: data.prerequisites || [],
          objectives: data.objectives || [],
          tags: data.tags || [],
          duration: data.duration || "",
          estimatedDuration: data.estimatedDuration || { value: 0, unit: "days" },
          type: data.type || "Video",
        });
      }
    } catch (err) {
      console.error("Error fetching course settings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleArrayChange = (
    field: keyof Pick<CourseSettings, "prerequisites" | "objectives" | "tags">,
    index: number,
    value: string
  ) => {
    setSettings((prev) => {
      const copy = [...prev[field]];
      copy[index] = value;
      return { ...prev, [field]: copy };
    });
  };

  const handleAddField = (
    field: keyof Pick<CourseSettings, "prerequisites" | "objectives" | "tags">
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/courses/${courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        alert("Settings saved successfully!");
        fetchSettings();
      } else {
        alert("Failed to save settings");
      }
    } catch (err) {
      console.error("Error saving course settings", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-yt-text-gray">Loading settings...</p>
      </div>
    );
  }

  // Helper function to calculate total days
  const calculateTotalDays = (estimatedDuration: { value: number; unit: string }) => {
    switch (estimatedDuration.unit) {
      case 'days': return estimatedDuration.value;
      case 'weeks': return estimatedDuration.value * 7;
      case 'months': return estimatedDuration.value * 30; // Approximation
      default: return estimatedDuration.value;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-yt-text-dark mb-4">Course Settings</h2>

    {/* Duration Input - Dual Purpose */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Display Duration (Student-facing) */}
      <div>
        <label className="block text-sm font-medium text-yt-text-dark mb-2">
          Display Duration
        </label>
        <input
          type="text"
          value={settings.duration}
          onChange={(e) => setSettings({ ...settings, duration: e.target.value })}
          placeholder="e.g. 3 weeks, 2 months"
          className="w-full px-3 py-2 border border-yt-light-border rounded-md"
        />
        <p className="text-xs text-gray-500 mt-1">Shown to students</p>
      </div>

      {/* Calculation Duration (Admin-only) */}
      <div>
        <label className="block text-sm font-medium text-yt-text-dark mb-2">
          Calculation Duration *
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            value={settings.estimatedDuration?.value || ""}
            onChange={(e) => setSettings({
              ...settings, 
              estimatedDuration: {
                ...settings.estimatedDuration,
                value: parseInt(e.target.value) || 0
              }
            })}
            placeholder="e.g. 21"
            className="w-1/2 px-3 py-2 border border-yt-light-border rounded-md"
          />
          <select
            value={settings.estimatedDuration?.unit || "days"}
            onChange={(e) => setSettings({
              ...settings,
              estimatedDuration: {
                ...settings.estimatedDuration,
                unit: e.target.value as "days" | "weeks" | "months" // Add type assertion
              }
            })}
            className="w-1/2 px-3 py-2 border border-yt-light-border rounded-md"
          >
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
          </select>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Used for progress tracking and alerts
        </p>
      </div>
    </div>

    {/* Helper text showing the conversion */}
    {settings.estimatedDuration?.value && (
      <div className="bg-blue-50 p-3 rounded-md">
        <p className="text-sm text-blue-700">
          <strong>Calculation:</strong> {settings.estimatedDuration.value} {settings.estimatedDuration.unit} = 
          {" "}{calculateTotalDays(settings.estimatedDuration)} days for progress tracking
        </p>
      </div>
    )}

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-yt-text-dark mb-2">Course Type</label>
        <select
          value={settings.type}
          onChange={(e) => setSettings({ ...settings, type: e.target.value })}
          className="w-full px-3 py-2 border border-yt-light-border rounded-md focus:ring-lfc-red focus:border-lfc-red"
        >
          <option>Video</option>
          <option>Audio</option>
          <option>Graphics</option>
          <option>Required</option>
          <option>Content Creation</option>
          <option>Utility</option>
          <option>Secretariat</option>
        </select>
      </div>

      {/* Dynamic fields */}
      {(["prerequisites", "objectives", "tags"] as const).map((field) => (
        <div key={field}>
          <label className="block text-sm font-medium text-yt-text-dark mb-2 capitalize">{field}</label>
          {settings[field].map((item: string, i: number) => (
            <input
              key={i}
              type="text"
              value={item}
              onChange={(e) => handleArrayChange(field, i, e.target.value)}
              placeholder={`Enter ${field.slice(0, -1)}...`}
              className="w-full px-3 py-2 mb-2 border border-yt-light-border rounded-md focus:ring-lfc-red focus:border-lfc-red"
            />
          ))}
          <button
            type="button"
            onClick={() => handleAddField(field)}
            className="text-sm text-blue-500 hover:underline"
          >
            + Add {field.slice(0, -1)}
          </button>
        </div>
      ))}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center px-4 py-2 bg-lfc-red text-white rounded-md hover:bg-lfc-gold-dark disabled:opacity-50"
      >
        <FaSave className="mr-2" />
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
