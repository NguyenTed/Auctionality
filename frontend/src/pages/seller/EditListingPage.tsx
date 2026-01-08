/**
 * Edit Listing Page
 * Seller page for editing existing auction listings
 */

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RichTextEditor from "../../components/RichTextEditor";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchCategoriesAsync,
  selectCategories,
} from "../../features/category/categorySlice";
import {
  updateProductAsync,
  selectSellerLoading,
} from "../../features/seller/sellerSlice";
import { fetchProductByIdAsync } from "../../features/product/productSlice";
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

export default function EditListingPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectCategories);
  const isLoading = useAppSelector(selectSellerLoading);
  const user = useAppSelector(selectUser);
  const product = useAppSelector((state) =>
    id ? state.product.products.find((p) => p.id === parseInt(id)) : null
  );
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

  const [hasBids, setHasBids] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);

  useEffect(() => {
    dispatch(fetchCategoriesAsync());
    
    if (id) {
      dispatch(fetchProductByIdAsync(parseInt(id)));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (product) {
      // Check if user is the seller
      if (product.sellerId !== user?.id) {
        toastError("You can only edit your own products");
        navigate("/seller/listings");
        return;
      }

      // Check if product has bids
      setHasBids((product.bidCount || 0) > 0);

      // Format dates for datetime-local input (YYYY-MM-DDTHH:mm)
      const formatDateForInput = (dateString: string | null | undefined) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setFormData({
        title: product.title || "",
        categoryId: product.category?.id || null,
        startPrice: product.startPrice?.toString() || "",
        bidIncrement: product.bidIncrement?.toString() || "",
        buyNowPrice: product.buyNowPrice?.toString() || "",
        startTime: formatDateForInput(product.startTime),
        endTime: formatDateForInput(product.endTime),
        autoExtensionEnabled: product.autoExtensionEnabled ?? true,
        description: product.description || "",
      });

      // Set images
      if (product.images && product.images.length > 0) {
        setImages(
          product.images.map((img) => ({
            url: img.url || "",
            isThumbnail: img.isThumbnail || false,
          }))
        );
      } else {
        setImages([
          { url: "", isThumbnail: true },
          { url: "", isThumbnail: false },
          { url: "", isThumbnail: false },
        ]);
      }

      setLoadingProduct(false);
    }
  }, [product, user, navigate, toastError]);

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
  };

  const handleImageChange = (
    index: number,
    field: keyof ProductImageInput,
    value: string | boolean
  ) => {
    setImages((prev) => {
      const newImages = [...prev];
      if (field === "isThumbnail" && value === true) {
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

  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
      return "Product title is required";
    }
    if (formData.title.trim().length < 3 || formData.title.trim().length > 200) {
      return "Product title must be between 3 and 200 characters";
    }
    if (!formData.categoryId) {
      return "Category is required";
    }
    if (!formData.startPrice || parseFloat(formData.startPrice) <= 0) {
      return "Start price must be greater than 0";
    }
    if (!formData.bidIncrement || parseFloat(formData.bidIncrement) <= 0) {
      return "Bid increment must be greater than 0";
    }
    if (!formData.startTime || !formData.endTime) {
      return "Start time and end time are required";
    }

    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);

    if (endTime <= startTime) {
      return "End time must be after start time";
    }

    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    if (durationHours < 1) {
      return "Auction duration must be at least 1 hour";
    }

    if (formData.buyNowPrice) {
      const buyNowPrice = parseFloat(formData.buyNowPrice);
      const startPrice = parseFloat(formData.startPrice);
      if (buyNowPrice <= 0) {
        return "Buy now price must be greater than 0";
      }
      if (buyNowPrice <= startPrice) {
        return "Buy now price must be greater than start price";
      }
    }

    const plainTextDescription = formData.description
      .replace(/<[^>]*>/g, "")
      .trim();
    if (!plainTextDescription || plainTextDescription.length < 10) {
      return "Description must be at least 10 characters";
    }
    if (plainTextDescription.length > 10000) {
      return "Description must not exceed 10000 characters";
    }

    const validImages = images.filter((img) => img.url.trim());
    if (validImages.length < 3) {
      return "At least 3 images are required";
    }
    if (validImages.length > 10) {
      return "Maximum 10 images allowed";
    }

    const urlPattern = /^https?:\/\/.+/i;
    for (let i = 0; i < validImages.length; i++) {
      const img = validImages[i];
      if (!urlPattern.test(img.url.trim())) {
        return `Image ${i + 1} URL must be a valid HTTP/HTTPS URL`;
      }
    }

    const hasThumbnail = validImages.some((img) => img.isThumbnail);
    if (!hasThumbnail) {
      return "At least one image must be marked as thumbnail";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      toastError("Product ID is missing");
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      toastError(validationError);
      return;
    }

    try {
      const validImages = images.filter((img) => img.url.trim());
      const imageDtos = validImages.map((img) => ({
        url: img.url.trim(),
        isThumbnail: img.isThumbnail,
      }));

      const result = await dispatch(
        updateProductAsync({
          id: parseInt(id),
          payload: {
            id: parseInt(id),
            title: formData.title,
            status: product?.status || "ACTIVE",
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
          } as any,
        })
      );

      if (updateProductAsync.fulfilled.match(result)) {
        success("Product updated successfully!");
        navigate("/seller/listings");
      } else {
        const errorPayload = result.payload as any;
        if (errorPayload && typeof errorPayload === "string") {
          toastError(errorPayload);
        } else if (errorPayload?.message) {
          toastError(errorPayload.message);
        } else if (errorPayload?.error) {
          toastError(errorPayload.error);
        } else {
          toastError("Failed to update product. Please check all fields and try again.");
        }
      }
    } catch (err: any) {
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
      console.error("Failed to update product:", err);
    }
  };

  if (loadingProduct) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Product not found</p>
        <button
          onClick={() => navigate("/seller/listings")}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Back to Listings
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <h1 className="text-3xl font-bold text-gray-900">Edit Listing</h1>

      {hasBids && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This product has existing bids. Only description and images can be updated.
          </p>
        </div>
      )}

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
              disabled={hasBids}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              minLength={3}
              maxLength={200}
            />
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
              disabled={hasBids}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
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
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <RichTextEditor
                value={formData.description}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, description: value }))
                }
                placeholder="Provide a detailed description of your product..."
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.replace(/<[^>]*>/g, "").length}/10000
              characters
            </p>
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
                disabled={hasBids}
                step="0.01"
                min="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              />
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
                disabled={hasBids}
                step="0.01"
                min="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              />
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
                disabled={hasBids}
                step="0.01"
                min="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
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
                disabled={hasBids}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              />
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
                disabled={hasBids}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
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
              disabled={hasBids}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded disabled:cursor-not-allowed"
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
            Update Listing
          </button>
        </div>
      </form>
    </div>
  );
}

