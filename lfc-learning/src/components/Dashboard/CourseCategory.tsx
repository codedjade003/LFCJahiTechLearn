interface CourseCategoryProps {
  name: string;
  selected?: boolean;
  onClick?: () => void;
}

const CourseCategory = ({ name, selected = false, onClick }: CourseCategoryProps) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 transition-colors
        ${
          selected
            ? "bg-yellow-500 text-white focus:ring-yellow-600"
            : "bg-gray-200 dark:bg-[var(--bg-elevated)] text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-[var(--bg-secondary)] focus:ring-gray-400"
        }`}
    >
      {name}
    </button>
  );
};

export default CourseCategory;
