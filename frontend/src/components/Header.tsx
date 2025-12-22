import { useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import SearchIcon from "@mui/icons-material/Search";

import logo from "../assets/imgs/catawikiLogo.png";
import type Category from "../interfaces/Category";
import { getCategoryTree } from "../api/categoryApi";

// const categories = ["Art", "Jewelry", "Watches", "Collectibles", "Cars"];

const Header = () => {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      const res = await getCategoryTree();
      setCategories(res.data);
    };

    loadCategories();
  }, []);

  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-7xl flex items-center gap-6 px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer">
          <img src={logo} alt="Catawiki" className="h-8 w-8" />
          <span className="text-xl font-semibold text-primary">catawiki</span>
        </div>

        {/* Categories */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 font-medium hover:text-primary"
          >
            Categories
            {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </button>

          {open && (
            <div className="absolute left-0 top-full mt-2 w-48 rounded-md border bg-white shadow-lg z-50">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="group relative px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    {c.name}
                    {c.children?.length ? (
                      <ExpandMoreIcon fontSize="small" />
                    ) : null}
                  </div>

                  {/* Sub categories */}
                  {c.children && c.children.length > 0 && (
                    <div className="absolute left-full top-0 hidden min-w-[200px] border bg-white shadow-lg group-hover:block">
                      {c.children.map((child) => (
                        <div
                          key={child.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer whitespace-nowrap group relative"
                        >
                          {child.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for title, category..."
            className="w-full rounded-full border pl-10 pr-4 py-2 focus:border-primary focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <FavoriteBorderIcon className="cursor-pointer text-primary hover:opacity-75 transition-opacity duration-300 ease-in-out" />

          <img
            src="https://i.pravatar.cc/32"
            alt="User"
            className="h-8 w-8 rounded-full cursor-pointer"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
