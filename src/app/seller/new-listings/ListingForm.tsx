"use client";

import { useState, ChangeEvent, FormEvent, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getApiBaseUrl } from "@/app/utils/authUtils";
import { fetchCategories } from "@/app/utils/categoryUtils";
import type { Category } from "@/app/utils/types";

interface ListingFormProps {
  listingId?: string;
}

export default function ListingForm({ listingId }: ListingFormProps) {
  const router = useRouter();
  
  // Get listingId from props
  const editListingId = listingId;

  const [form, setForm] = useState({
    title: "",
    price: "",
    category: "",
    description: "",
    imageFile: null as File | null,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingListing, setLoadingListing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const isEditMode = !!editListingId;

  // Maps the category names from dropdown → backend numeric IDs (built from fetched categories)
  const CATEGORY_MAP = useMemo(() => {
    const map: Record<string, number> = {};
    categories.forEach(cat => {
      map[cat.name] = Number(cat.id);
    });
    return map;
  }, [categories]);

  // Reverse map: category ID → name (built from fetched categories)
  const CATEGORY_ID_TO_NAME = useMemo(() => {
    const map: Record<number, string> = {};
    categories.forEach(cat => {
      map[Number(cat.id)] = cat.name;
    });
    return map;
  }, [categories]);

  // Fetch categories from backend
  useEffect(() => {
    async function loadCategories() {
      try {
        setLoadingCategories(true);
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setError("Failed to load categories. Please refresh the page.");
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  // -------------- HANDLE INPUT --------------
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, imageFile: file }));
  };

  // -------------- FETCH LISTING DATA FOR EDIT MODE --------------
  useEffect(() => {
    if (!isEditMode) return;

    async function fetchListing() {
      setLoadingListing(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You are not logged in.");
          setLoadingListing(false);
          return;
        }

        const res = await fetch(`${getApiBaseUrl()}/api/listings/${editListingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch listing.");
        }

        const listing = await res.json();

        // Populate form with existing data
        setForm({
          title: listing.title || "",
          price: listing.price || "",
          category: listing.category_id ? CATEGORY_ID_TO_NAME[Number(listing.category_id)] || "" : "",
          description: listing.description || "",
          imageFile: null, // Don't pre-populate file input
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingListing(false);
      }
    }

    fetchListing();
  }, [isEditMode, editListingId]);

  // -------------- UPLOAD PHOTO TO LISTING --------------
  async function uploadPhotoToListing(listingId: string, file: File): Promise<void> {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("You are not logged in");
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${getApiBaseUrl()}/api/listings/${listingId}/photos`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.message || errorData.error || "Image upload failed");
    }
  }

  // -------------- SUBMIT FORM --------------
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate category selection
      if (!CATEGORY_MAP[form.category]) {
        setError("Please select a valid category.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }

      // Prepare payload for backend
      const payload: {
        title: string;
        price: number;
        description?: string;
        category_id: string;
      } = {
        title: form.title,
        price: Number(form.price),
        category_id: String(CATEGORY_MAP[form.category]),
      };

      if (form.description) {
        payload.description = form.description;
      }

      if (isEditMode) {
        // UPDATE EXISTING LISTING
        const res = await fetch(`${getApiBaseUrl()}/api/listings/${editListingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to update listing.");
        }

        // Upload new photo if provided
        if (form.imageFile) {
          try {
            await uploadPhotoToListing(editListingId, form.imageFile);
          } catch (uploadError: any) {
            console.error("Photo upload failed:", uploadError);
            alert(`Listing updated successfully, but image upload failed: ${uploadError.message}`);
            router.push("/seller/dashboard");
            return;
          }
        }

        alert("Listing updated successfully!");
        router.push("/seller/dashboard");
      } else {
        // CREATE NEW LISTING
        const res = await fetch(`${getApiBaseUrl()}/api/listings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to create listing.");
        }

        const listingData = await res.json();
        const newListingId = listingData.id;

        // Upload photo if provided
        if (form.imageFile && newListingId) {
          try {
            await uploadPhotoToListing(newListingId, form.imageFile);
          } catch (uploadError: any) {
            console.error("Photo upload failed:", uploadError);
            alert(`Listing created successfully, but image upload failed: ${uploadError.message}`);
            router.push("/seller/dashboard");
            return;
          }
        }

        alert("Listing created successfully!");
        router.push("/seller/dashboard");
      }

    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // -------------- DELETE LISTING -------------- 
  const handleDelete = async () => {
    if (!editListingId) return;
    
    if (!confirm(`Are you sure you want to delete "${form.title}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in.");
        setIsDeleting(false);
        return;
      }

      const res = await fetch(`${getApiBaseUrl()}/api/listings/${editListingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        let errorMessage = "Failed to delete listing";
        try {
          const errorData = await res.json();
          console.error("Delete error response:", errorData, "Status:", res.status);
          // Handle empty object or missing error property
          if (errorData && typeof errorData === 'object') {
            errorMessage = errorData.error || errorData.message || errorMessage;
          }
        } catch (parseError) {
          // If response is not JSON, try to get text
          const textError = await res.text().catch(() => "Unknown error");
          console.error("Delete error (non-JSON):", textError, "Status:", res.status);
          errorMessage = textError || errorMessage;
        }
        
        // Provide more helpful error messages based on status code or error message
        if (res.status === 500 || errorMessage.toLowerCase().includes("internal server error") || errorMessage === "Failed to delete listing") {
          throw new Error("Cannot delete listing. This listing may have active reports or conversations. Please contact support if you need assistance.");
        }
        
        throw new Error(errorMessage);
      }

      alert("Listing deleted successfully!");
      router.push("/seller/dashboard");
    } catch (error: any) {
      alert(`Failed to delete listing: ${error.message}`);
      console.error("Error deleting listing:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // -------------- FORM UI -------------- 
  if (loadingListing || loadingCategories) {
    return <p className="text-center p-4">Loading...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="bg-red-100 text-red-600 p-2 rounded text-center">{error}</p>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full border rounded-md p-2"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Price ($)</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
            required
            disabled={categories.length === 0}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Upload Image <span className="text-gray-500 text-xs">(Optional)</span>
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full p-2 border rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full border rounded-md p-2"
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading 
            ? (isEditMode ? "Updating..." : "Submitting...") 
            : (isEditMode ? "Update Listing" : "Submit Listing")
          }
        </button>
        
        {isEditMode && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>
    </form>
  );
}
