import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";

import logo from "../assets/imgs/catawikiLogo.png";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  selectUser,
  selectIsAuthenticated,
  logoutAsync,
} from "../features/auth/authSlice";
import {
  fetchCategoriesAsync,
  selectCategories,
} from "../features/category/categorySlice";

const Header = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const categories = useAppSelector(selectCategories);

  const [open, setOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    dispatch(fetchCategoriesAsync());
  }, [dispatch]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserMenu && !target.closest(".relative")) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-7xl flex items-center gap-6 px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <img src={logo} alt="Catawiki" className="h-8 w-8" />
          <span className="text-xl font-semibold text-primary">catawiki</span>
        </Link>

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
        <form
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const keyword = formData.get("search") as string;
            if (keyword) {
              navigate(`/products?keyword=${encodeURIComponent(keyword)}`);
            }
          }}
        >
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="search"
            placeholder="Search for title, category..."
            className="w-full rounded-full border pl-10 pr-4 py-2 focus:border-primary focus:outline-none"
          />
        </form>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated && user && (
            <FavoriteBorderIcon className="cursor-pointer text-primary hover:opacity-75 transition-opacity duration-300 ease-in-out" />
          )}

          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <span className="text-sm text-gray-700 hidden sm:inline">
                  {user.fullName || user.email}
                </span>
                <img
                  src={user.avatarUrl || "https://i.pravatar.cc/32"}
                  alt="User"
                  className="h-8 w-8 rounded-full cursor-pointer"
                />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-md border bg-white shadow-lg z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">
                      {user.fullName || user.email}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <button
                    onClick={async () => {
                      await dispatch(logoutAsync());
                      setShowUserMenu(false);
                      navigate("/login");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <LogoutIcon fontSize="small" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 hover:text-primary"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="text-sm font-medium text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-md"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
