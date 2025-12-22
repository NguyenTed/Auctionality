import { BrowserRouter, Routes, Route } from "react-router-dom";
import GuestLayout from "../layouts/GuestLayout";
import HomePage from "../pages/common/HomePage";

// import ProductCreate from "../pages/products/ProductCreate";
// import ProductEdit from "../pages/products/ProductEdit";
// import NotFound from "../pages/NotFound";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Guest */}
        <Route element={<GuestLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
