import express from 'express';
import { createListing, uploadImages,deleteListing,updateListing } from '../controllers/listing.controller.js';
import { verifyToken } from '../middleware/auth.js';
import upload from '../config/storage.js';

const router = express.Router();

router.post('/upload-images', verifyToken, upload.array('images', 6), uploadImages);


router.post('/create', verifyToken, createListing);


router.delete('/delete/:id', verifyToken, deleteListing); 

router.post('editListing/:id', verifyToken, updateListing);
export default router;
