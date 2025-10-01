// CourseCategories.tsx - Updated to handle both categories and types
import CourseCategory from "./CourseCategory";

interface CourseCategoriesProps {
  // Get all unique values from both categories and types
  filterOptions: string[];
  selectedFilter: string;
  onSelectFilter?: (filter: string) => void;
  filterType: 'category' | 'type'; // Specify what we're filtering by
}

const CourseCategories = ({ 
  filterOptions, 
  selectedFilter, 
  onSelectFilter,
}: CourseCategoriesProps) => {
  const handleClick = (filter: string) => {
    if (onSelectFilter) onSelectFilter(filter);
  };

  return (
    <div className="mb-6">
      {/* Remove or simplify the heading */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filterOptions.map((option) => (
          <CourseCategory
            key={option}
            name={option}
            selected={option === selectedFilter}
            onClick={() => handleClick(option)}
          />
        ))}
      </div>
    </div>
  );
};

export default CourseCategories;