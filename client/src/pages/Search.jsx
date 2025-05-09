import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ListingItem from "../components/ListingItem";
import {
  FaSearch,
  FaHome,
  FaSort,
  FaCar,
  FaCouch,
  FaTags,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebardata, setSidebardata] = useState({
    searchTerm: "",
    type: "all",
    parking: false,
    furnished: false,
    offer: false,
    sort: "createdAt",
    order: "desc",
  });

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);

    const searchTermFromUrl = urlParams.get("searchTerm") || "";
    const typeFromUrl = urlParams.get("type") || "all";
    const parkingFromUrl = urlParams.get("parking") === "true";
    const furnishedFromUrl = urlParams.get("furnished") === "true";
    const offerFromUrl = urlParams.get("offer") === "true";
    const sortFromUrl = urlParams.get("sort") || "createdAt";
    const orderFromUrl = urlParams.get("order") || "desc";

    setSidebardata({
      searchTerm: searchTermFromUrl,
      type: typeFromUrl,
      parking: parkingFromUrl,
      furnished: furnishedFromUrl,
      offer: offerFromUrl,
      sort: sortFromUrl,
      order: orderFromUrl,
    });

    const fetchListings = async () => {
      setLoading(true);
      const searchQuery = urlParams.toString();
      try {
        const res = await fetch(`/api/listings/get?${searchQuery}`);
        const data = await res.json();
        setListings(data);
      } catch (error) {
        console.error("Error fetching listings:", error);
        setListings([]);
      }
      setLoading(false);
    };

    fetchListings();
  }, [location.search]);

  const handleChange = (e) => {
    const { id, value, checked } = e.target;

    if (id === "searchTerm") {
      setSidebardata((prev) => ({ ...prev, searchTerm: value }));
    }

    if (["rent", "sale", "all"].includes(id)) {
      setSidebardata((prev) => ({ ...prev, type: id }));
    }

    if (["parking", "furnished", "offer"].includes(id)) {
      setSidebardata((prev) => ({ ...prev, [id]: checked }));
    }

    if (id === "sort_order") {
      const [sort, order] = value.split("_");
      setSidebardata((prev) => ({ ...prev, sort, order }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();

    if (sidebardata.searchTerm)
      urlParams.set("searchTerm", sidebardata.searchTerm);
    if (sidebardata.type !== "all") urlParams.set("type", sidebardata.type);
    if (sidebardata.parking) urlParams.set("parking", true);
    if (sidebardata.furnished) urlParams.set("furnished", true);
    if (sidebardata.offer) urlParams.set("offer", true);
    urlParams.set("sort", sidebardata.sort);
    urlParams.set("order", sidebardata.order);

    navigate(`/search?${urlParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br  from-orange-100 to-blue-100">
      {/* FILTER BAR */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto   max-w-6xl flex flex-wrap justify-center items-center gap-4  p-6 rounded-xl"
      >
        {/* Search */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-inner">
          <FaSearch className="text-slate-500" />
          <input
            type="text"
            id="searchTerm"
            placeholder="Search..."
            className="outline-none w-[150px] sm:w-[180px] bg-transparent"
            value={sidebardata.searchTerm}
            onChange={handleChange}
          />
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-inner">
          <FaHome className="text-slate-500" />
          {["all", "rent", "sale"].map((type) => (
            <label
              key={type}
              className="flex items-center gap-1 text-sm text-slate-700 font-medium"
            >
              <input
                type="radio"
                id={type}
                name="type"
                className="accent-blue-600"
                checked={sidebardata.type === type}
                onChange={handleChange}
              />
              <span className="capitalize">{type}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-inner">
          <label className="flex items-center gap-1">
            <FaCar className="text-slate-500" />
            <input
              type="checkbox"
              id="parking"
              checked={sidebardata.parking}
              onChange={handleChange}
              className="accent-green-600"
            />
            <span>Parking</span>
          </label>
          <label className="flex items-center gap-1">
            <FaCouch className="text-slate-500" />
            <input
              type="checkbox"
              id="furnished"
              checked={sidebardata.furnished}
              onChange={handleChange}
              className="accent-green-600"
            />
            <span>Furnished</span>
          </label>
          <label className="flex items-center gap-1">
            <FaTags className="text-slate-500" />
            <input
              type="checkbox"
              id="offer"
              checked={sidebardata.offer}
              onChange={handleChange}
              className="accent-green-600"
            />
            <span>Offer</span>
          </label>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-inner">
          <FaSort className="text-slate-500" />
          <select
            id="sort_order"
            className="outline-none bg-transparent"
            defaultValue="createdAt_desc"
            onChange={handleChange}
          >
            <option value="regularPrice_desc">Price high to low</option>
            <option value="regularPrice_asc">Price low to high</option>
            <option value="createdAt_desc">Latest</option>
            <option value="createdAt_asc">Oldest</option>
          </select>
        </div>

        <button className="bg-slate-700 text-white px-6 py-2 rounded-lg uppercase font-semibold hover:opacity-90 transition">
          Search
        </button>
      </motion.form>

      <div className="px-6 py-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-4 text-center">
          Listing Results
        </h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {loading && (
            <p className="col-span-full text-center text-lg text-slate-600">
              Loading...
            </p>
          )}
          {!loading && listings.length === 0 && (
            <p className="col-span-full text-center text-lg text-slate-600">
              No Listings Found!
            </p>
          )}
          {!loading &&
            listings.map((listing) => (
              <ListingItem key={listing._id} listing={listing} />
            ))}
        </motion.div>
      </div>
    </div>
  );
}
