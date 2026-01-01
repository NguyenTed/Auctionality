/**
 * Create Listing Page
 * Seller page for creating new auction listings
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchCategoriesAsync, selectCategories } from "../../features/category/categorySlice";
import { createProductAsync as createSellerProductAsync, selectSellerLoading } from "../../features/seller/sellerSlice";
import { selectUser } from "../../features/auth/authSlice";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../../components/Toast";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

interface ProductImageInput {
  url: string;
  isThumbnail: boolean;
}

export default function CreateListingPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectCategories);
  const isLoading = useAppSelector(selectSellerLoading);
  const user = useAppSelector(selectUser);
  const { toasts, success, error: toastError, removeToast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    categoryId: null as number | null,
    startPrice: "",
    bidIncrement: "",
    buyNowPrice: "",
    startTime: "",
    endTime: "",
    autoExtensionEnabled: true,
    description: "",
  });

  const [images, setImages] = useState<ProductImageInput[]>([
    { url: "", isThumbnail: true },
    { url: "", isThumbnail: false },
    { url: "", isThumbnail: false },
  ]);

  useEffect(() => {
    dispatch(fetchCategoriesAsync());
  }, [dispatch]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "categoryId") {
      setFormData((prev) => ({ ...prev, [name]: value ? parseInt(value) : null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (index: number, field: keyof ProductImageInput, value: string | boolean) => {
    setImages((prev) => {
      const newImages = [...prev];
      if (field === "isThumbnail" && value === true) {
        // Unset other thumbnails
        newImages.forEach((img, i) => {
          if (i !== index) img.isThumbnail = false;
        });
      }
      newImages[index] = { ...newImages[index], [field]: value };
      return newImages;
    });
  };

  const addImageField = () => {
    if (images.length < 10) {
      setImages([...images, { url: "", isThumbnail: false }]);
    }
  };

  const removeImageField = (index: number) => {
    if (images.length > 3) {
      setImages(images.filter((_, i) => i !== index));
    }
  };

  const flattenCategories = (cats: typeof categories, result: typeof categories = []): typeof categories => {
    for (const cat of cats) {
      result.push(cat);
      if (cat.children && cat.children.length > 0) {
        flattenCategories(cat.children, result);
      }
    }
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toastError("Product title is required");
      return;
    }
    if (!formData.categoryId) {
      toastError("Category is required");
      return;
    }
    if (!formData.startPrice || parseFloat(formData.startPrice) <= 0) {
      toastError("Start price must be greater than 0");
      return;
    }
    if (!formData.bidIncrement || parseFloat(formData.bidIncrement) <= 0) {
      toastError("Bid increment must be greater than 0");
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      toastError("Start time and end time are required");
      return;
    }
    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      toastError("End time must be after start time");
      return;
    }
    if (!formData.description.trim() || formData.description.length < 10) {
      toastError("Description must be at least 10 characters");
      return;
    }

    const validImages = images.filter((img) => img.url.trim());
    if (validImages.length < 3) {
      toastError("At least 3 images are required");
      return;
    }

    const hasThumbnail = validImages.some((img) => img.isThumbnail);
    if (!hasThumbnail) {
      toastError("At least one image must be marked as thumbnail");
      return;
    }

    try {
      // Prepare images for backend
      const imageDtos = validImages.map((img) => ({
        url: img.url.trim(),
        isThumbnail: img.isThumbnail,
      }));

      const result = await dispatch(
        createSellerProductAsync({
          id: null,
          title: formData.title,
          status: "ACTIVE",
          startPrice: parseFloat(formData.startPrice),
          bidIncrement: parseFloat(formData.bidIncrement),
          buyNowPrice: formData.buyNowPrice ? parseFloat(formData.buyNowPrice) : undefined,
          startTime: new Date(formData.startTime),
          endTime: new Date(formData.endTime),
          autoExtensionEnabled: formData.autoExtensionEnabled,
          sellerId: user?.id || 0,
          categoryId: formData.categoryId,
          subcategoryId: null,
          description: formData.description,
          images: imageDtos,
        } as any)
      );

      if (createSellerProductAsync.fulfilled.match(result)) {
        success("Product created successfully!");
        navigate("/seller/listings");
      } else {
        toastError(result.payload as string || "Failed to create product");
      }
    } catch (err) {
      toastError("An unexpected error occurred");
      console.error("Failed to create product:", err);
    }
  };

  return (
    <div className="space-y-8">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <h1 className="text-3xl font-bold text-gray-900">Create New Listing</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Basic Information</h2>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Product Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              required
              minLength={3}
              maxLength={200}
            />
          </div>

          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId || ""}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              required
            >
              <option value="">Select a category</option>
              {flattenCategories(categories).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              required
              minLength={10}
              maxLength={10000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/10000 characters
            </p>
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Pricing</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="startPrice" className="block text-sm font-medium text-gray-700 mb-2">
                Start Price (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="startPrice"
                name="startPrice"
                value={formData.startPrice}
                onChange={handleInputChange}
                step="0.01"
                min="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="bidIncrement" className="block text-sm font-medium text-gray-700 mb-2">
                Bid Increment (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="bidIncrement"
                name="bidIncrement"
                value={formData.bidIncrement}
                onChange={handleInputChange}
                step="0.01"
                min="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="buyNowPrice" className="block text-sm font-medium text-gray-700 mb-2">
                Buy Now Price (€) <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="number"
                id="buyNowPrice"
                name="buyNowPrice"
                value={formData.buyNowPrice}
                onChange={handleInputChange}
                step="0.01"
                min="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Auction Timing */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Auction Timing</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoExtensionEnabled"
              name="autoExtensionEnabled"
              checked={formData.autoExtensionEnabled}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="autoExtensionEnabled" className="ml-2 block text-sm text-gray-900">
              Enable auto-extension (extends auction if bid placed near end time)
            </label>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 flex-1">
              Product Images <span className="text-red-500">*</span>
            </h2>
            {images.length < 10 && (
              <button
                type="button"
                onClick={addImageField}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
              >
                <AddIcon className="mr-2" fontSize="small" />
                Add Image
              </button>
            )}
          </div>

          <p className="text-sm text-gray-500">
            At least 3 images required. Mark one as thumbnail. Maximum 10 images.
          </p>

          {images.map((image, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image {index + 1} URL
                </label>
                <input
                  type="url"
                  value={image.url}
                  onChange={(e) => handleImageChange(index, "url", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="flex items-center gap-4 pt-8">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={image.isThumbnail}
                    onChange={(e) => handleImageChange(index, "isThumbnail", e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Thumbnail</span>
                </label>
                {images.length > 3 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <DeleteIcon fontSize="small" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate("/seller/listings")}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
            disabled={isLoading}
          >
            <CancelIcon className="mr-2" /> Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <SaveIcon className="mr-2" />
            )}
            Create Listing
          </button>
        </div>
      </form>
    </div>
  );
}

