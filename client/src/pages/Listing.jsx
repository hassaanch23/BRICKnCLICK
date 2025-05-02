import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules"; // Correct import
import { Autoplay } from "swiper/modules"; // Correct import
import { FaSpinner } from "react-icons/fa";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import "swiper/css/navigation";
import "swiper/css"; // Import Swiper styles

function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [modalImage, setModalImage] = useState(null); // State to store the clicked image
  const params = useParams();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await fetch(`/api/listings/get/${params.listingId}`);
        if (!res.ok) throw new Error("Failed to fetch listing");
        const data = await res.json();
        if (data.success === false) {
          setError(true);
          return;
        }
        setListing(data);
      } catch (error) {
        console.error("Error fetching listing:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  // Function to open modal with the clicked image
  const openModal = (url) => {
    setModalImage(url);
  };

  // Function to close the modal
  const closeModal = () => {
    setModalImage(null);
  };

  return (
    <main className="w-full min-h-screen bg-gray-100 flex  flex-col items-center">
      {loading && (
        <div className="flex justify-center my-7 text-4xl text-blue-500 animate-spin">
          <FaSpinner />
        </div>
      )}
      {error && (
        <p className="text-2xl text-center text-red-500">
          Something went wrong
        </p>
      )}

      {listing && !loading && !error && (
        <div className="relative w-full mx-auto overflow-visible">
          <div className="absolute top-0 bottom-0 left-0 w-10 bg-gradient-to-r from-gray-100 to-transparent z-10"></div>
          <div className="absolute top-0 bottom-0 right-0 w-10 bg-gradient-to-l from-gray-100 to-transparent z-10"></div>

          {/* Previous Arrow */}
          <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10">
            <button
              className="w-6 h-12 bg-white rounded-xl shadow-md text-gray-700 hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center hover:scale-105"
              aria-label="Previous"
            >
              <FaChevronLeft className="text-xl" />
            </button>
          </div>

          {/* Next Arrow */}
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10">
            <button
              className="w-6 h-12 bg-white rounded-xl shadow-md text-gray-700 hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center hover:scale-105"
              aria-label="Next"
            >
              <FaChevronRight className="text-xl" />
            </button>
          </div>

          <Swiper
            navigation={{
              prevEl: ".swiper-button-prev",
              nextEl: ".swiper-button-next",
            }}
            slidesPerView={1.4}
            spaceBetween={20}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            modules={[Navigation, Autoplay]}
            className="z-20"
          >
            {listing.imageUrls.map((url, index) => (
              <SwiperSlide key={index}>
                <div className="w-full h-[500px] flex justify-center items-center transition-transform duration-300 ease-in-out">
                  <img
                    src={url}
                    alt={`Slide ${index}`}
                    className="h-full w-full object-cover rounded-xl shadow-xl border border-gray-200 hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => openModal(url)} // Open modal on image click
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {modalImage && (
        <div
          className="fixed inset-0 bg-transparent bg-opacity-90 flex justify-center items-center z-30 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div className="relative max-w-5xl">
            <img
              src={modalImage}
              alt="Full-size"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <button
              className="absolute top-3 w-10 right-3 px-2 py-1  text-white rounded-full shadow-2xl bg-red-600 bg-opacity-50 hover:bg-opacity-70
                hover:text-white transition duration-300 ease-in-out transform hover:scale-120  text-center
                "
              onClick={closeModal}
            >
              <span className="font-bold text-2xl">&times;</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Listing;
