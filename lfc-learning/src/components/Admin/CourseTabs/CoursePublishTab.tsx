// src/pages/Admin/CoursePublishTab.tsx
import { useEffect, useState } from "react";
import {
  FaEye,
  FaEyeSlash,
  FaPaperPlane,
  FaUsers,
  FaDownload,
} from "react-icons/fa";

type Module = {
  _id?: string;
  type: string;
  title: string;
  contentUrl?: string;
  duration?: string;
  questions?: { question: string; options: string[]; correctAnswer: string }[];
  dueDate?: string | null;
};

type Section = {
  _id?: string;
  title: string;
  description?: string;
  modules: Module[];
};

type Assignment = {
  _id?: string;
  title: string;
  instructions?: string;
  submissionType?: string;
  dueDate?: string;
};

type Project = {
  title?: string;
  instructions?: string;
  submissionType?: string;
  dueDate?: string;
} | null;

type Course = {
  _id: string;
  title: string;
  description: string;
  categories: string[] | string;
  level?: string;
  tags?: string[] | string;
  thumbnail?: string;
  promoVideo?: string;
  duration?: string;
  prerequisites?: string[] | string;
  objectives?: string[] | string;
  sections?: Section[];
  assignments?: Assignment[];
  project?: Project;
  instructor?: { name?: string; avatar?: string };
  type?: string;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export default function CoursePublishTab({ courseId }: { courseId: string }) {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [publishing, setPublishing] = useState<boolean>(false);
  const [togglingPublic, setTogglingPublic] = useState<boolean>(false);
  const [notifyAll, setNotifyAll] = useState<boolean>(false);
  const [enrollingAll, setEnrollingAll] = useState<boolean>(false);
  const [sectionsOpen, setSectionsOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function fetchCourse() {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch course (${res.status})`);
      }
      const data: Course = await res.json();
      setCourse(data);
      // initialize sectionsOpen (collapsed)
      const initial: Record<string, boolean> = {};
      (data.sections || []).forEach((s) => {
        if (s._id) initial[s._id] = false;
      });
      setSectionsOpen(initial);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  }

  // helpers to normalize values that might be string or array
  function toArray(value?: string[] | string) {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }

  async function togglePublic() {
    if (!course) return;
    setTogglingPublic(true);
    try {
      const token = localStorage.getItem("token");
      // Use update course route to set isPublic
      const res = await fetch(`${API_BASE}/api/courses/${course._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPublic: !course.isPublic }),
      });
      if (!res.ok) throw new Error("Failed to update visibility");
      const updated = await res.json();
      setCourse((prev) => (prev ? { ...prev, isPublic: updated.isPublic ?? !prev.isPublic } : prev));
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to change visibility");
    } finally {
      setTogglingPublic(false);
    }
  }

  async function publishCourse() {
    if (!course) return;
    setPublishing(true);
    try {
      const token = localStorage.getItem("token");
      // For publishing we'll update isPublic + optionally notify all users
      const res = await fetch(`${API_BASE}/api/courses/${course._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPublic: true }),
      });
      if (!res.ok) throw new Error("Failed to publish course");
      // optionally notify all users
      if (notifyAll) {
        await fetch(`${API_BASE}/api/notifications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: `New course: ${course.title}`,
            message: course.description ? course.description.substring(0, 220) : `${course.title} now available.`,
            link: `/courses/${course._id}`,
            global: true, // optional flag your backend might accept
          }),
        }).catch((err) => {
          console.warn("Notification failed (non-fatal)", err);
        });
      }
      // refresh course
      await fetchCourse();
      alert("Course published (isPublic = true)");
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to publish course");
    } finally {
      setPublishing(false);
    }
  }

  async function enrollAllUsers() {
    if (!course) return;
    if (!confirm("Enroll ALL users in this course? This action may be irreversible.")) return;
    setEnrollingAll(true);
    try {
      const token = localStorage.getItem("token");
      // NOTE: backend endpoint for enrolling all users may or may not exist.
      // Attempt a reasonable admin endpoint; backend owners can adapt.
      const res = await fetch(`${API_BASE}/api/enrollments/enroll-all/${course._id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 404) {
        // try alternative path
        const alt = await fetch(`${API_BASE}/api/courses/${course._id}/enroll-all`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!alt.ok) throw new Error("Enroll-all endpoint not found on server");
        alert("All users enrolled (via alternate endpoint).");
      } else if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to enroll all users");
      } else {
        alert("All users enrolled successfully.");
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to enroll all users");
    } finally {
      setEnrollingAll(false);
    }
  }

  async function enrollSomeUsersPrompt() {
    if (!course) return;
    const ids = prompt("Enter comma-separated user IDs to enroll (e.g. id1,id2):");
    if (!ids) return;
    const userIds = ids.split(",").map((s) => s.trim()).filter(Boolean);
    if (userIds.length === 0) return;
    try {
      const token = localStorage.getItem("token");
      // Hypothetical admin bulk enroll endpoint
      const res = await fetch(`${API_BASE}/api/enrollments/enroll-users/${course._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userIds }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to enroll users");
      }
      alert("Users enrolled successfully.");
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to enroll users");
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-yt-light-hover rounded w-3/4" />
          <div className="h-4 bg-yt-light-hover rounded w-1/2" />
          <div className="h-40 bg-yt-light-hover rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-md">{error}</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6">
        <div className="bg-yt-light-hover p-6 rounded-md text-yt-text-gray">No course data available.</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Thumbnail */}
          <div className="w-40 h-24 bg-gray-100 dark:bg-[var(--bg-tertiary)] dark:bg-[var(--bg-tertiary)] rounded-md overflow-hidden flex-shrink-0 border border-gray-200 dark:border-[var(--border-primary)] dark:border-[var(--border-primary)]">
            {course.thumbnail ? (
              // resolve to absolute URL if necessary
              <img
                src={course.thumbnail.startsWith("http") ? course.thumbnail : `${API_BASE}${course.thumbnail}`}
                alt={course.title}
                className="w-full min-h-full object-cover"
              />
            ) : (
              <div className="w-full min-h-full flex items-center justify-center text-yt-text-gray bg-gray-50 dark:bg-[var(--bg-secondary)] dark:bg-[var(--bg-secondary)]">
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-yt-text-dark">{course.title}</h2>
            <p className="text-sm text-yt-text-gray mt-1 max-w-2xl">{course.description}</p>

            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <span className="px-2 py-1 bg-gray-100 dark:bg-[var(--bg-tertiary)] dark:bg-[var(--bg-tertiary)] rounded-md text-xs text-yt-text-dark font-medium">{course.level}</span>
              {toArray(course.categories).map((c, idx) => (
                <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-[var(--bg-tertiary)] dark:bg-[var(--bg-tertiary)] rounded-md text-xs text-yt-text-dark font-medium">{c}</span>
              ))}
              {toArray(course.tags).map((t, idx) => (
                <span key={`tag-${idx}`} className="px-2 py-1 bg-gray-100 dark:bg-[var(--bg-tertiary)] dark:bg-[var(--bg-tertiary)] rounded-md text-xs text-yt-text-dark font-medium">#{t}</span>
              ))}
            </div>

            <div className="mt-3 flex gap-3 items-center">
              <button
                onClick={togglePublic}
                disabled={togglingPublic}
                className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 transition ${
                  course.isPublic 
                    ? "bg-red-600 text-white hover:bg-red-700" 
                    : "bg-white border border-gray-300 text-yt-text-dark hover:bg-gray-50 dark:bg-[var(--bg-secondary)] dark:bg-[var(--bg-secondary)]"
                }`}
                title={course.isPublic ? "Make private" : "Make public"}
              >
                {course.isPublic ? <FaEye /> : <FaEyeSlash />} {course.isPublic ? "Public" : "Private"}
              </button>

              <label className="flex items-center gap-2 text-sm text-yt-text-gray">
                <input type="checkbox" checked={notifyAll} onChange={(e) => setNotifyAll(e.target.checked)} className="rounded" />
                <span>Notify all users on publish</span>
              </label>
            </div>
          </div>
        </div>

        {/* promo video preview */}
        <div className="w-80">
          <h4 className="text-sm font-medium text-yt-text-dark mb-2">Promo Video</h4>
          <div className="w-full aspect-video bg-gray-50 dark:bg-[var(--bg-secondary)] dark:bg-[var(--bg-secondary)] rounded-md overflow-hidden border border-gray-200 dark:border-[var(--border-primary)] dark:border-[var(--border-primary)]">
            {course.promoVideo ? (
              <video src={course.promoVideo.startsWith("http") ? course.promoVideo : `${API_BASE}${course.promoVideo}`} controls className="w-full min-h-full object-contain" />
            ) : (
              <div className="w-full min-h-full flex items-center justify-center text-yt-text-gray p-4 bg-gray-50 dark:bg-[var(--bg-secondary)] dark:bg-[var(--bg-secondary)]">
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <div className="text-sm ml-3">No promo video</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full details */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: overview */}
        <div className="flex-1 space-y-4 min-w-0">
          <section className="bg-white dark:bg-[var(--bg-elevated)] p-5 rounded-lg shadow-sm border border-gray-200 dark:border-[var(--border-primary)] dark:border-[var(--border-primary)]">
            <h3 className="text-lg font-semibold text-yt-text-dark mb-3">Overview</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-yt-text-dark">
              <div><span className="font-medium">Duration:</span> {course.duration || "—"}</div>
              <div><span className="font-medium">Created:</span> {course.createdAt ? new Date(course.createdAt).toLocaleString() : "—"}</div>
              <div><span className="font-medium">Instructor:</span> {course.instructor?.name || "Unknown"}</div>
              <div><span className="font-medium">Category:</span> {course.type || "—"}</div>
            </div>

            {/* Objectives / prerequisites */}
            <div className="mt-5 grid grid-cols-2 gap-5 text-sm">
              <div>
                <h4 className="font-medium mb-2">Objectives</h4>
                {toArray(course.objectives).length ? (
                  <ul className="list-disc pl-5 text-yt-text-dark space-y-1">
                    {toArray(course.objectives).map((o, i) => <li key={i}>{o}</li>)}
                  </ul>
                ) : <div className="text-yt-text-gray">No objectives provided.</div>}
              </div>
              <div>
                <h4 className="font-medium mb-2">Prerequisites</h4>
                {toArray(course.prerequisites).length ? (
                  <ul className="list-disc pl-5 text-yt-text-dark space-y-1">
                    {toArray(course.prerequisites).map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                ) : <div className="text-yt-text-gray">No prerequisites provided.</div>}
              </div>
            </div>
          </section>

          {/* Sections -> modules */}
          <section className="bg-white dark:bg-[var(--bg-elevated)] p-5 rounded-lg shadow-sm border border-gray-200 dark:border-[var(--border-primary)] dark:border-[var(--border-primary)]">            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-yt-text-dark">Sections & Modules</h3>
              <div className="text-sm text-yt-text-gray">{(course.sections || []).length} sections</div>
            </div>

            {(course.sections || []).length === 0 ? (
              <div className="text-yt-text-gray">No sections added yet.</div>
            ) : (
              <div className="space-y-4">
                {(course.sections || []).map((section, si) => {
                  const sid = section._id || `sec-${si}`;
                  return (
                    <div key={sid} className="border border-gray-200 dark:border-[var(--border-primary)] dark:border-[var(--border-primary)] rounded-md overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setSectionsOpen((s) => ({ ...s, [sid]: !s[sid] }))}
                        className="w-full text-left px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-[var(--bg-secondary)] dark:bg-[var(--bg-secondary)] hover:bg-gray-100 dark:bg-[var(--bg-tertiary)] dark:bg-[var(--bg-tertiary)] transition-colors"
                      >
                        <div>
                          <div className="font-medium text-yt-text-dark">{section.title}</div>
                          {section.description && <div className="text-xs text-yt-text-gray mt-1">{section.description}</div>}
                        </div>
                        <div className="text-xs text-yt-text-gray">{sectionsOpen[sid] ? "Collapse" : "Expand"}</div>
                      </button>

                      {sectionsOpen[sid] && (
                        <div className="p-4 bg-white dark:bg-[var(--bg-elevated)]">
                          {section.modules && section.modules.length ? (
                            <ul className="space-y-3">
                              {section.modules.map((m, mi) => (
                                <li key={m._id || `m-${mi}`} className="p-3 border border-gray-200 dark:border-[var(--border-primary)] dark:border-[var(--border-primary)] rounded-md">
                                  <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gray-100 dark:bg-[var(--bg-tertiary)] dark:bg-[var(--bg-tertiary)] rounded-md flex items-center justify-center text-sm font-medium">
                                      {m.type?.toUpperCase?.() || m.type}
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium">{m.title}</div>
                                      {m.duration && <div className="text-xs text-yt-text-gray mt-1">Duration: {m.duration}</div>}
                                      {m.contentUrl && (
                                        <div className="mt-2">
                                          {m.type === "video" ? (
                                            <video 
                                              src={m.contentUrl.startsWith("http") ? m.contentUrl : `${API_BASE}${m.contentUrl}`} 
                                              controls 
                                              className="w-full max-h-48 rounded-md" 
                                            />
                                          ) : m.type === "pdf" ? (
                                            <a 
                                              href={m.contentUrl.startsWith("http") ? m.contentUrl : `${API_BASE}${m.contentUrl}`} 
                                              target="_blank" 
                                              rel="noreferrer" 
                                              className="text-sm text-red-600 hover:text-red-700 underline inline-flex items-center gap-2"
                                            >
                                              <FaDownload /> View PDF
                                            </a>
                                          ) : (
                                            <div className="text-xs text-yt-text-gray">Content URL: {m.contentUrl}</div>
                                          )}
                                        </div>
                                      )}
                                      {m.questions && m.questions.length > 0 && (
                                        <div className="mt-2 text-xs text-yt-text-gray">
                                          {m.questions.length} question(s)
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-yt-text-gray">No modules in this section.</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Assignments */}
          <section className="bg-white dark:bg-[var(--bg-elevated)] p-5 rounded-lg shadow-sm border border-gray-200 dark:border-[var(--border-primary)] dark:border-[var(--border-primary)]">            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-yt-text-dark">Assignments</h3>
              <div className="text-sm text-yt-text-gray">{(course.assignments || []).length}</div>
            </div>

            {(course.assignments || []).length === 0 ? (
              <div className="text-yt-text-gray">No assignments added.</div>
            ) : (
              <div className="space-y-3">
                {(course.assignments || []).map((a, i) => (
                  <div key={a._id || `a-${i}`} className="p-3 border border-gray-200 dark:border-[var(--border-primary)] dark:border-[var(--border-primary)] rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{a.title}</div>
                        {a.instructions && <div className="text-sm text-yt-text-gray mt-1">{a.instructions}</div>}
                      </div>
                      <div className="text-xs text-yt-text-gray whitespace-nowrap">
                        Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "—"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Project */}
          <section className="bg-white dark:bg-[var(--bg-elevated)] p-5 rounded-lg shadow-sm border border-gray-200 dark:border-[var(--border-primary)] dark:border-[var(--border-primary)]">            <h3 className="text-lg font-semibold text-yt-text-dark mb-3">Project</h3>
            {course.project ? (
              <div>
                <div className="font-medium">{course.project.title}</div>
                <p className="text-sm text-yt-text-gray mt-1">{course.project.instructions}</p>
                <div className="mt-2 text-xs text-yt-text-gray">
                  Submission: {course.project.submissionType || "file_upload"} • Due: {course.project.dueDate ? new Date(course.project.dueDate).toLocaleDateString() : "—"}
                </div>
              </div>
            ) : (
              <div className="text-yt-text-gray">No project configured.</div>
            )}
          </section>
        </div>

        {/* Right: controls / preview */}
        <aside className="w-full lg:w-96 space-y-4 flex-shrink-0">
          <div className="bg-white dark:bg-[var(--bg-elevated)] p-5 rounded-lg shadow-sm border border-gray-200 dark:border-[var(--border-primary)] dark:border-[var(--border-primary)]">
            <h4 className="text-sm font-semibold text-yt-text-dark mb-3">Instructor</h4>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-[var(--bg-tertiary)] dark:bg-[var(--bg-tertiary)] border border-gray-200 dark:border-[var(--border-primary)] dark:border-[var(--border-primary)]">
                {course.instructor?.avatar ? (
                  <img src={course.instructor.avatar.startsWith("http") ? course.instructor.avatar : `${API_BASE}${course.instructor.avatar}`} alt={course.instructor?.name} className="w-full min-h-full object-cover" />
                ) : (
                  <div className="w-full min-h-full flex items-center justify-center bg-yellow-500 text-white font-bold">{(course.instructor?.name?.charAt(0) || "?").toUpperCase()}</div>
                )}
              </div>
              <div>
                <div className="text-sm font-medium">{course.instructor?.name || "Unknown Instructor"}</div>
                <div className="text-xs text-yt-text-gray">Sub Unit: {course.type}</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[var(--bg-elevated)] p-5 rounded-lg shadow-sm border border-gray-200 dark:border-[var(--border-primary)] dark:border-[var(--border-primary)]">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-yt-text-dark">Course Data</div>
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(course, null, 2);
                  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
                  const exportFileDefaultName = `${course.title.replace(/\s+/g, '_')}_data.json`;
                  
                  const linkElement = document.createElement('a');
                  linkElement.setAttribute('href', dataUri);
                  linkElement.setAttribute('download', exportFileDefaultName);
                  linkElement.click();
                }}
                className="px-3 py-1.5 bg-gray-100 dark:bg-[var(--bg-tertiary)] dark:bg-[var(--bg-tertiary)] hover:bg-gray-200 text-yt-text-dark rounded-md text-sm font-medium transition-colors flex items-center gap-2"
              >
                <FaDownload className="text-sm" />
                Download JSON
              </button>
            </div>
            <div className="text-xs text-yt-text-gray">
              Download the complete course data as a JSON file for backup or analysis.
            </div>
          </div>

                    <div className="bg-white dark:bg-[var(--bg-elevated)] p-5 rounded-lg shadow-sm border border-gray-200 dark:border-[var(--border-primary)] dark:border-[var(--border-primary)]">
            <h4 className="text-sm font-semibold text-yt-text-dark mb-3">Preview & Publish</h4>
            <div className="text-sm text-yt-text-gray mb-4">
              Look through the course contents above. Use the controls to change visibility, enroll users, or publish.
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Visibility</div>
                <div className="text-sm">{course.isPublic ? "Public" : "Private"}</div>
              </div>

              <button
                onClick={publishCourse}
                disabled={publishing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-medium"
              >
                <FaPaperPlane /> {publishing ? "Publishing..." : "Publish Course"}
              </button>

              <button
                onClick={enrollAllUsers}
                disabled={enrollingAll}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-[var(--bg-elevated)] border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-[var(--bg-secondary)] dark:bg-[var(--bg-secondary)] transition font-medium"
                title="Enroll all users (admin endpoint required)"
              >
                <FaUsers /> {enrollingAll ? "Enrolling..." : "Enroll all users"}
              </button>

              <button
                onClick={enrollSomeUsersPrompt}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-[var(--bg-elevated)] border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-[var(--bg-secondary)] dark:bg-[var(--bg-secondary)] transition font-medium"
              >
                <FaUsers /> Enroll specific users
              </button>

              <div className="mt-2 flex items-center gap-2 text-sm text-yt-text-gray">
                <input
                  id="notifyOnPublish"
                  type="checkbox"
                  checked={notifyAll}
                  onChange={(e) => setNotifyAll(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="notifyOnPublish">Send notification to all users when publishing</label>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}