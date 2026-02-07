interface CertificateCardProps {
  studentName: string;
  courseTitle: string;
  completionDate: string | Date;
  issuedAt?: string | Date;
  finalScore?: number;
  instructorName?: string;
  certificateId: string;
  metadata?: {
    courseDuration?: string;
    courseLevel?: string;
  };
  showIssuer?: boolean;
}

const formatDate = (value?: string | Date) => {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function CertificateCard({
  studentName,
  courseTitle,
  completionDate,
  issuedAt,
  finalScore,
  instructorName,
  certificateId,
  metadata,
  showIssuer = true,
}: CertificateCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      <div className="absolute -top-28 -right-24 h-64 w-64 rounded-full bg-lfc-red/10 blur-3xl" />
      <div className="absolute -bottom-28 -left-24 h-64 w-64 rounded-full bg-lfc-gold/10 blur-3xl" />
      <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-lfc-red via-lfc-gold to-lfc-red" />

      <div className="relative px-6 py-10 sm:px-10">
        <div className="flex flex-col items-center text-center gap-4">
          <img src="/logo.png" alt="LFC Tech Learn Logo" className="h-14 w-auto" />
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
            Certificate of Completion
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-slate-900">
            {studentName}
          </h1>
          <p className="text-slate-600">has successfully completed</p>
          <p className="text-2xl sm:text-3xl font-semibold text-lfc-red">
            {courseTitle}
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-slate-500">Completion</p>
            <p className="text-lg font-semibold text-slate-900">
              {formatDate(completionDate)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-slate-500">Issued</p>
            <p className="text-lg font-semibold text-slate-900">
              {formatDate(issuedAt || completionDate)}
            </p>
          </div>
          {metadata?.courseLevel && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-slate-500">Level</p>
              <p className="text-lg font-semibold text-slate-900">{metadata.courseLevel}</p>
            </div>
          )}
          {metadata?.courseDuration && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-slate-500">Duration</p>
              <p className="text-lg font-semibold text-slate-900">{metadata.courseDuration}</p>
            </div>
          )}
          {typeof finalScore === "number" && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 sm:col-span-2">
              <p className="text-xs uppercase tracking-wider text-emerald-700">Final Score</p>
              <p className="text-2xl font-semibold text-emerald-700">{finalScore}%</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 text-center">
          <span className="text-xs uppercase tracking-widest text-slate-400">Certificate ID</span>
          <span className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-mono text-sm font-semibold text-slate-800">
            {certificateId}
          </span>
        </div>

        {showIssuer && instructorName && (
          <div className="mt-10 flex justify-center">
            <div className="text-center">
              <div className="mx-auto h-px w-48 bg-slate-300 mb-2" />
              <p className="font-semibold text-slate-900">{instructorName}</p>
              <p className="text-sm text-slate-500">Course Instructor</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
