import Listing from '../models/listing.model.js';
import mongoose from 'mongoose'; 

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

export const deleteListing = async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
    }
    if(req.user.id !== listing.userRef) {
        return res.status(403).json({ message: 'You are not authorized to delete this listing' });
    }
    try{
        await Listing.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: 'Listing deleted successfully' }); 

    }catch (error) {
        next(error);
    }
}

export const  updateListing = async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
    }
    if(req.user.id !== listing.userRef) {
        return res.status(403).json({ message: 'You are not authorized to update this listing' });
    }
    try {
        const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
        return res.status(200).json(updatedListing);    
    }
        
        catch (error) {
        next(error);}

}

export const getListing = async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid listing ID" });
    }
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        return res.status(200).json(listing);
    } catch (error) {
        next(error);
    }
}