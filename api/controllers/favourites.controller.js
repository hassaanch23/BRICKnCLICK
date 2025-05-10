import User from "../models/user.js";

// Add listing to favorites
export const addFavorite = async (req, res) => {
  try {
    const { listingId } = req.body;
    const userId = req.user.id; 

    const user = await User.findById(userId);
    if (!user) return res.status(404).send("User not found");

    if (user.favorites.includes(listingId)) {
      return res.status(400).send("Listing already in favorites");
    }

    user.favorites.push(listingId);
    await user.save();

    res.status(200).send("Listing added to favorites");
  } catch (err) {
    res.status(500).send("Server error");
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const { listingId } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).send("User not found");

    user.favorites = user.favorites.filter(id => id.toString() !== listingId);
    await user.save();

    res.status(200).send("Listing removed from favorites");
  } catch (err) {
    res.status(500).send("Server error");
  }
};

export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate("favorites");
    if (!user) return res.status(404).send("User not found");

    res.status(200).json(user.favorites);
  } catch (err) {
    res.status(500).send("Server error");
  }
};
