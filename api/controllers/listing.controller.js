import Listing from '../models/listing.model.js';

export const createListing = async (req, res, next) => {
    try {
        const {
            name,
            description,
            address,
            regularPrice,
            discountPrice,
            bathrooms,
            bedrooms,
            furnished,
            parking,
            offer,
            type,
            imageUrls, 
            userRef,
        } = req.body;

        const newListing = new Listing({
            name,
            description,
            address,
            regularPrice,
            discountPrice,
            bathrooms,
            bedrooms,
            furnished,
            parking,
            offer,
            type,
            imageUrls,
            userRef,
        });

        const savedListing = await newListing.save();
        return res.status(201).json(savedListing);
    } catch (error) {
        next(error);
    }
};

export const uploadImages = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images provided.' });
        }
        const imageUrls = req.files.map(file => file.path);

        return res.status(200).json({ imageUrls });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Image upload failed.' });
    }
};
