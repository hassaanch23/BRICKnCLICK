import express from 'express';
import { createListing, uploadImages } from '../controllers/listing.controller.js';
import { verifyToken } from '../middleware/auth.js';
import upload from '../config/storage.js';

const router = express.Router();

router.post('/upload-images', verifyToken, upload.array('images', 6), uploadImages);

router.post('/create', verifyToken, createListing);

export default router;
