import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type Category from "../interfaces/Category";

const CategoryItem = ({ category }: { category: Category }) => {
  return (
    <div className="group relative px-4 py-2 hover:bg-gray-100 cursor-pointer whitespace-nowrap">
      <div className="flex justify-between items-center">
        {category.name}
        {category.children?.length ? <ExpandMoreIcon fontSize="small" /> : null}
      </div>

      {category.children && category.children.length > 0 && (
        <div className="absolute left-full top-0 hidden min-w-[200px] border bg-white shadow-lg group-hover:block">
          {category.children.map((child) => (
            <CategoryItem key={child.id} category={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryItem;
