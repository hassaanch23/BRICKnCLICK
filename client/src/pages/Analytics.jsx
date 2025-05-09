import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

function Analytics() {
  const [showButtons, setShowButtons] = useState(false);
  const [showPriceGraph, setShowPriceGraph] = useState(false);
  const [showListingsGraph, setShowListingsGraph] = useState(false);

  // Sample mocked data — this will be dynamic later
  const priceDistributionData = [
    { price: 10000, sell: 5, rent: 2 },
    { price: 20000, sell: 9, rent: 3 },
    { price: 30000, sell: 12, rent: 6 },
    { price: 40000, sell: 7, rent: 5 },
    { price: 50000, sell: 3, rent: 1 },
  ];

  const listings = [
    { id: 1, hasCarParking: true, hasDiscount: true, hasGarden: false, isPetFriendly: true },
    { id: 2, hasCarParking: false, hasDiscount: true, hasGarden: true, isPetFriendly: false },
    { id: 3, hasCarParking: true, hasDiscount: false, hasGarden: true, isPetFriendly: true },
    // ... more listings
  ];

  // Count features of listings (Car Parking, Discount, etc.)
  const countFeatures = () => {
    let carParking = 0;
    let discount = 0;
    let garden = 0;
    let petFriendly = 0;

    listings.forEach(listing => {
      if (listing.hasCarParking) carParking++;
      if (listing.hasDiscount) discount++;
      if (listing.hasGarden) garden++;
      if (listing.isPetFriendly) petFriendly++;
    });

    return [
      { name: 'Car Parking', count: carParking },
      { name: 'Discount Offers', count: discount },
      { name: 'Garden', count: garden },
      { name: 'Pet Friendly', count: petFriendly },
    ];
  };

  const chartData = countFeatures();

  // Proper use of useEffect to handle button visibility timing
  useEffect(() => {
    const timer = setTimeout(() => setShowButtons(true), 100); // Show buttons after 100ms delay
    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, []);

  // Event handler for showing price graph
  const handlePriceDistributionClick = () => {
    setShowButtons(false);
    // Delay the appearance of the graph for transition effect
    setTimeout(() => setShowPriceGraph(true), 400);
  };

  // Event handler for showing listings graph
  const handleListingsOverTimeClick = () => {
    setShowButtons(false);
    setTimeout(() => setShowListingsGraph(true), 400);
  };

  return (
    <div className="analytics-container">
      {!showPriceGraph && !showListingsGraph && (
        <div className={`button-wrapper ${showButtons ? 'visible' : ''}`}>
          <button className="analytics-btn">Top Listings</button>
          <button className="analytics-btn" onClick={handlePriceDistributionClick}>
            Price Distribution
          </button>
          <button className="analytics-btn" onClick={handleListingsOverTimeClick}>
            Amenities
          </button>
        </div>
      )}

      {showPriceGraph && (
        <div className="chart-container">
          <h2 className="chart-title">Price Distribution (Sell vs Rent)</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={priceDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="price" label={{ value: 'Price', position: 'insideBottomRight', offset: -5 }} />
              <YAxis label={{ value: 'Number of Listings', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sell" stroke="#4ade80" name="Sell Listings" />
              <Line type="monotone" dataKey="rent" stroke="#60a5fa" name="Rent Listings" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {showListingsGraph && (
        <div className="chart-container">
          <h2 className="chart-title">Listings Over Time (Feature Counts)</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default Analytics;
