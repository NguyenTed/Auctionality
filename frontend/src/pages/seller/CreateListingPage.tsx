/**
 * Create Listing Page
 * Seller page for creating new auction listings
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RichTextEditor from "../../components/RichTextEditor";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchCategoriesAsync,
  selectCategories,
} from "../../features/category/categorySlice";
import {
  createProductAsync as createSellerProductAsync,
  selectSellerLoading,
} from "../../features/seller/sellerSlice";
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

  const [errors, setErrors] = useState<{
    title?: string;
    categoryId?: string;
    startPrice?: string;
    bidIncrement?: string;
    buyNowPrice?: string;
    startTime?: string;
    endTime?: string;
    description?: string;
    images?: string;
    [key: string]: string | undefined;
  }>({});

  useEffect(() => {
    dispatch(fetchCategoriesAsync());

    // Load draft from localStorage
    const savedDraft = localStorage.getItem("product-draft");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setFormData(draft.formData || formData);
        setImages(draft.images || images);
      } catch (err) {
        console.error("Failed to load draft:", err);
      }
    }
  }, [dispatch]);

  // Save draft to localStorage whenever form data or images change
  useEffect(() => {
    const draft = {
      formData,
      images,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("product-draft", JSON.stringify(draft));
  }, [formData, images]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "categoryId") {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? parseInt(value) : null,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleImageChange = (
    index: number,
    field: keyof ProductImageInput,
    value: string | boolean
  ) => {
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

    // Clear image errors when user starts typing
    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: undefined }));
    }
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

  const flattenCategories = (
    cats: typeof categories,
    result: typeof categories = []
  ): typeof categories => {
    for (const cat of cats) {
      result.push(cat);
      if (cat.children && cat.children.length > 0) {
        flattenCategories(cat.children, result);
      }
    }
    return result;
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Product title is required";
    } else if (
      formData.title.trim().length < 3 ||
      formData.title.trim().length > 200
    ) {
      newErrors.title = "Product title must be between 3 and 200 characters";
    }

    // Category validation
    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }

    // Start price validation
    if (!formData.startPrice || parseFloat(formData.startPrice) <= 0) {
      newErrors.startPrice = "Start price must be greater than 0";
    }

    // Bid increment validation
    if (!formData.bidIncrement || parseFloat(formData.bidIncrement) <= 0) {
      newErrors.bidIncrement = "Bid increment must be greater than 0";
    }

    // Start time validation
    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    } else {
      const now = new Date();
      const startTime = new Date(formData.startTime);
      // Start time must be in the future (allow 5 minutes buffer for server time differences)
      if (startTime <= new Date(now.getTime() - 5 * 60 * 1000)) {
        newErrors.startTime = "Start time must be in the future";
      }
    }

    // End time validation
    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    } else if (formData.startTime) {
      const startTime = new Date(formData.startTime);
      const endTime = new Date(formData.endTime);
      
      if (endTime <= startTime) {
        newErrors.endTime = "End time must be after start time";
      } else {
        // Minimum auction duration: 1 hour
        const durationHours =
          (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        if (durationHours < 1) {
          newErrors.endTime = "Auction duration must be at least 1 hour";
        }
      }
    }

    // Buy now price validation
    if (formData.buyNowPrice) {
      const buyNowPrice = parseFloat(formData.buyNowPrice);
      const startPrice = parseFloat(formData.startPrice);
      if (buyNowPrice <= 0) {
        newErrors.buyNowPrice = "Buy now price must be greater than 0";
      } else if (startPrice && buyNowPrice <= startPrice) {
        newErrors.buyNowPrice = "Buy now price must be greater than start price";
      }
    }

    // Description validation
    const plainTextDescription = formData.description
      .replace(/<[^>]*>/g, "")
      .trim();
    if (!plainTextDescription || plainTextDescription.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    } else if (plainTextDescription.length > 10000) {
      newErrors.description = "Description must not exceed 10000 characters";
    }

    // Image validation
    const validImages = images.filter((img) => img.url.trim());
    if (validImages.length < 3) {
      newErrors.images = "At least 3 images are required";
    } else if (validImages.length > 10) {
      newErrors.images = "Maximum 10 images allowed";
    } else {
      // Image URL format validation
      const urlPattern = /^https?:\/\/.+/i;
      for (let i = 0; i < validImages.length; i++) {
        const img = validImages[i];
        if (!urlPattern.test(img.url.trim())) {
          newErrors.images = `Image ${i + 1} URL must be a valid HTTP/HTTPS URL`;
          break;
        }
      }

      if (!newErrors.images) {
        const hasThumbnail = validImages.some((img) => img.isThumbnail);
        if (!hasThumbnail) {
          newErrors.images = "At least one image must be marked as thumbnail";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Run validation
    if (!validateForm()) {
      // Scroll to first error after state update
      setTimeout(() => {
        const firstErrorField = Object.keys(errors)[0];
        if (firstErrorField) {
          const element = document.querySelector(`[name="${firstErrorField}"]`) || 
                         document.querySelector(`#${firstErrorField}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      }, 100);
      return;
    }

    try {
      // Prepare images for backend
      const validImages = images.filter((img) => img.url.trim());
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
          buyNowPrice: formData.buyNowPrice
            ? parseFloat(formData.buyNowPrice)
            : undefined,
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
        // Clear draft from localStorage
        localStorage.removeItem("product-draft");
        navigate("/seller/listings");
      } else {
        // Handle backend validation errors
        const errorPayload = result.payload as any;
        if (errorPayload && typeof errorPayload === "string") {
          toastError(errorPayload);
        } else if (errorPayload?.message) {
          toastError(errorPayload.message);
        } else if (errorPayload?.error) {
          toastError(errorPayload.error);
        } else {
          toastError(
            "Failed to create product. Please check all fields and try again."
          );
        }
      }
    } catch (err: any) {
      // Handle axios errors with detailed messages
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.message) {
          toastError(errorData.message);
        } else if (errorData.error) {
          toastError(errorData.error);
        } else if (typeof errorData === "string") {
          toastError(errorData);
        } else {
          toastError("An unexpected error occurred");
        }
      } else {
        toastError("An unexpected error occurred");
      }
      console.error("Failed to create product:", err);
    }
  };

  return (
    <div className="space-y-8">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <h1 className="text-3xl font-bold text-gray-900">Create New Listing</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm p-8 space-y-6"
      >
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
            Basic Information
          </h2>

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Product Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
                errors.title ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="categoryId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId || ""}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
                errors.categoryId ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            >
              <option value="">Select a category</option>
              {flattenCategories(categories).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
              </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <div className={`mt-1 ${errors.description ? "border-2 border-red-500 rounded-lg p-2" : ""}`}>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, description: value }));
                  if (errors.description) {
                    setErrors((prev) => ({ ...prev, description: undefined }));
                  }
                }}
                placeholder="Provide a detailed description of your product..."
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.replace(/<[^>]*>/g, "").length}/10000
              characters
            </p>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
            Pricing
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="startPrice"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
                  errors.startPrice ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.startPrice && (
                <p className="mt-1 text-sm text-red-600">{errors.startPrice}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="bidIncrement"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
                  errors.bidIncrement ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.bidIncrement && (
                <p className="mt-1 text-sm text-red-600">{errors.bidIncrement}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="buyNowPrice"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Buy Now Price (€){" "}
                <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="number"
                id="buyNowPrice"
                name="buyNowPrice"
                value={formData.buyNowPrice}
                onChange={handleInputChange}
                step="0.01"
                min="0.01"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
                  errors.buyNowPrice ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.buyNowPrice && (
                <p className="mt-1 text-sm text-red-600">{errors.buyNowPrice}</p>
              )}
            </div>
          </div>
        </div>

        {/* Auction Timing */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
            Auction Timing
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startTime"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
                  errors.startTime ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="endTime"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
                  errors.endTime ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.endTime && (
                <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
              )}
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
            <label
              htmlFor="autoExtensionEnabled"
              className="ml-2 block text-sm text-gray-900"
            >
              Enable auto-extension (extends auction if bid placed near end
              time)
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
            At least 3 images required. Mark one as thumbnail. Maximum 10
            images.
          </p>
          {errors.images && (
            <p className="mt-1 text-sm text-red-600">{errors.images}</p>
          )}

          {images.map((image, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image {index + 1} URL
                </label>
                <input
                  type="url"
                  value={image.url}
                  onChange={(e) =>
                    handleImageChange(index, "url", e.target.value)
                  }
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                />
                {/* Image Preview */}
                {image.url.trim() && (
                  <div className="mt-2">
                    <img
                      src={image.url}
                      alt={`Preview ${index + 1}`}
                      className="max-w-xs max-h-48 object-contain border border-gray-200 rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                      onLoad={(e) => {
                        (e.target as HTMLImageElement).style.display = "block";
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 pt-8">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={image.isThumbnail}
                    onChange={(e) =>
                      handleImageChange(index, "isThumbnail", e.target.checked)
                    }
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
