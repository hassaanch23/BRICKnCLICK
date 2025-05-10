import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFavorites } from '../redux/user/favoriteSlice';
import axios from 'axios';
import ListingItem from '../components/ListingItem';
import { toast } from 'react-hot-toast'; 

function Favourites() {
  const dispatch = useDispatch();
  const favoriteIds = useSelector((state) => state.favorites.items);
  const token = useSelector((state) => state.user.token);
  const [favoriteListings, setFavoriteListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  useEffect(() => {
    if (favoriteIds.length === 0) return;

    const fetchListings = async () => {
      setLoadingListings(true);
      setError(null);

      try {
        const res = await axios.get('http://localhost:3000/api/listings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const filteredFavorites = res.data.filter((listing) =>
          favoriteIds.includes(listing._id)
        );

        setFavoriteListings(filteredFavorites);
      } catch (err) {
        setError('Failed to load listings.');
        toast.error('Failed to load listings.'); // Show error toast
      } finally {
        setLoadingListings(false);
      }
    };

    fetchListings();
  }, [favoriteIds, token]); // Run effect only when favoriteIds or token change

  return (
    <div className="min-h-[92vh] mx-auto px-4 py-8 bg-gradient-to-br from-orange-300 to-blue-300">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Your Favorite Listings</h2>

      {loadingListings && (
        <div className="flex justify-center items-center mb-8">
      
        <div className="w-16 h-16 border-4 border-t-4 border-blue-600 border-dotted rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
 </div>
      )}

      {error && <div className="text-center text-lg text-red-500 mb-8">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {favoriteListings.map((listing) => (
          <ListingItem key={listing._id} listing={listing} />
        ))}
      </div>
    </div>
  );
}

export default Favourites;