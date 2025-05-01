import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

export default function CreateListing() {
  const [files, setFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    regularPrice: "",
    discountPrice: "",
    bathrooms: "",
    bedrooms: "",
    furnished: false,
    parking: false,
    offer: false,
    type: "",
    userRef: "",
  });

  const currentUser = useSelector((state) => state.user);
  const token = currentUser?.token;
  console.log("currentUser:", currentUser);

  useEffect(() => {
    if (currentUser?.currentUser?._id) {
      setFormData((prev) => ({ ...prev, userRef: currentUser.currentUser._id }));
    }
  }, [currentUser]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const MAX_SIZE = 5 * 1024 * 1024;
    const ALLOWED_FORMATS = ["image/jpeg", "image/png", "image/jpg"];

    const validFiles = selectedFiles.filter((file) => {
      const isValidSize = file.size <= MAX_SIZE;
      const isValidFormat = ALLOWED_FORMATS.includes(file.type);
      if (!isValidSize) alert(`${file.name} is too large. Max 5MB.`);
      if (!isValidFormat) alert(`${file.name} has invalid format.`);
      return isValidSize && isValidFormat;
    });

    if (validFiles.length + files.length > 6) {
      alert("You can upload up to 6 images total.");
      return;
    }

    setFiles((prev) => [...prev, ...validFiles]);

    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const handleImageUpload = async () => {
    if (files.length === 0) return alert("Please select images first.");
    if (files.length > 6) return alert("You can upload up to 6 images.");

    try {
      const imageFormData = new FormData();
      files.forEach((file) => imageFormData.append("images", file));

      const res = await axios.post("/api/listings/upload-images", imageFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setImageUrls(res.data.imageUrls);
      alert("Images uploaded successfully!");
    } catch (error) {
      console.error(error);
      alert("Image upload failed.");
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    if (imageUrls.length === 0) return alert("Please upload images first.");
    if (+formData.regularPrice < +formData.discountPrice) return alert("Invalid Discount price")

    try {
      const listingData = {
        ...formData,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        regularPrice: Number(formData.regularPrice),
        discountPrice: Number(formData.discountPrice),
        imageUrls,
      };

      console.log("Listing data before submission:", listingData);

      await axios.post("/api/listings/create", listingData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Listing created successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to create listing.");
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
    setPreviewUrls((prevUrls) => prevUrls.filter((_, index) => index !== indexToRemove));
  };

  const isSubmitDisabled = !formData.name || !formData.description || imageUrls.length === 0;

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Create a Listing</h1>
      <form className="flex flex-col sm:flex-row gap-4" onSubmit={handleCreateListing}>
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength="62"
            minLength="10"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <textarea
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            id="address"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          {/* Type Radio */}
          <div className="flex gap-6 flex-wrap">
            {["sell", "rent"].map((type) => (
              <div className="flex gap-2" key={type}>
                <input
                  type="radio"
                  id={type}
                  name="type"
                  value={type}
                  checked={formData.type === type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-5"
                />
                <label htmlFor={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</label>
              </div>
            ))}

            {/* Checkboxes */}
            {["parking", "furnished", "offer"].map((field) => (
              <div className="flex gap-2" key={field}>
                <input
                  type="checkbox"
                  id={field}
                  className="w-5"
                  checked={formData[field]}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.checked })}
                />
                <span>{field.charAt(0).toUpperCase() + field.slice(1)}</span>
              </div>
            ))}
          </div>

            {/* Numeric Inputs */}
<div className="flex flex-col gap-6">
  {/* Beds and Baths */}
  <div className="flex flex-wrap gap-6">
    {[
      { id: "bedrooms", label: "Beds" },
      { id: "bathrooms", label: "Baths" },
    ].map(({ id, label }) => (
      <div className="flex items-center gap-2" key={id}>
        <input
          type="number"
          id={id}
          min="1"
          required
          className="p-3 border border-gray-300 rounded-lg"
          value={formData[id]}
          onChange={(e) => setFormData({ ...formData, [id]: e.target.value })}
        />
        <div className="flex flex-col items-start">
          <p>{label}</p>
        </div>
      </div>
    ))}
  </div>

  {/* Regular & Discounted Price in same row */}
  <div className="flex gap-6 items-center">
    {/* Regular Price */}
    <div className="flex items-center gap-2">
      <input
        type="number"
        id="regularPrice"
        min="1"
        required
        className="p-3 border border-gray-300 rounded-lg w-20"
        value={formData.regularPrice}
        onChange={(e) => setFormData({ ...formData, regularPrice: e.target.value })}
      />
      <div className="flex flex-col items-start">
        <p>Regular price</p>
        <span className="text-xs">($/month)</span>
      </div>
    </div>

    {/* Conditionally Render Discounted Price */}
    {formData.offer && (
      <div className="flex items-center gap-2">
        <input
          type="number"
          id="discountPrice"
          min="1"
          required
          className="p-3 border border-gray-300 rounded-lg w-20"
          value={formData.discountPrice}
          onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
        />
        <div className="flex flex-col items-start">
          <p>Discounted price</p>
          <span className="text-xs">($/month)</span>
        </div>
      </div>
    )}
  </div>
</div>

          </div>
        


        {/* Image Upload & Submit */}
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:
            <span className="font-normal text-gray-600 ml-2">First image is cover - Max. 6</span>
          </p>
          <div className="flex gap-4">
            <label
              htmlFor="images"
              className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg cursor-pointer w-full text-center"
            >
              Choose File
            </label>
            <input
              onChange={handleFileChange}
              type="file"
              className="hidden"
              id="images"
              accept="image/*"
              multiple
            />
            <button
              onClick={handleImageUpload}
              type="button"
              className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
            >
              Upload
            </button>
          </div>

          {previewUrls.length > 0 && (
            <div className="flex flex-col gap-4 mt-4">
              {previewUrls.map((url, index) => (
                <div
                  key={index}
                  className="border p-2 rounded flex justify-between items-center"
                >
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-20 h-20 object-contain rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="ml-4 px-4 py-2 text-white bg-red-700 rounded-lg uppercase hover:bg-red-800 transition"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
            disabled={isSubmitDisabled}
          >
            Create Listing
          </button>
        </div>
      </form>
    </main>
  );
}
