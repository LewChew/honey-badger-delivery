const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'video/mp4': '.mp4',
    'video/quicktime': '.mov',
    'video/x-msvideo': '.avi',
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Helper function to generate unique filename
const generateFileName = (originalName, userId, type = 'media') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const extension = path.extname(originalName).toLowerCase();
  return `${type}/${userId}/${timestamp}_${random}${extension}`;
};

// Helper function to upload to S3
const uploadToS3 = async (file, fileName) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read', // Make files publicly accessible
  };

  const result = await s3.upload(params).promise();
  return result.Location;
};

// Upload single file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided',
        message: 'Please select a file to upload'
      });
    }

    const { type = 'media', challengeId } = req.body;
    
    // Validate challenge access if provided
    if (challengeId) {
      const challenge = await prisma.challenge.findFirst({
        where: {
          id: challengeId,
          OR: [
            { senderId: req.user.userId },
            { recipientId: req.user.userId }
          ]
        }
      });

      if (!challenge) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You do not have access to this challenge'
        });
      }
    }

    // Generate unique filename
    const fileName = generateFileName(req.file.originalname, req.user.userId, type);
    
    // Upload to S3
    const fileUrl = await uploadToS3(req.file, fileName);
    
    logger.info(`File uploaded: ${fileName} by user ${req.user.userId}`);
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      url: fileUrl,
      fileName,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    });

  } catch (error) {
    logger.error('Error uploading file:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size must be less than 50MB'
      });
    }
    
    res.status(500).json({
      error: 'Upload failed',
      message: 'An error occurred while uploading the file'
    });
  }
});

// Upload multiple files
router.post('/upload-multiple', upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No files provided',
        message: 'Please select files to upload'
      });
    }

    const { type = 'media', challengeId } = req.body;
    
    // Validate challenge access if provided
    if (challengeId) {
      const challenge = await prisma.challenge.findFirst({
        where: {
          id: challengeId,
          OR: [
            { senderId: req.user.userId },
            { recipientId: req.user.userId }
          ]
        }
      });

      if (!challenge) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You do not have access to this challenge'
        });
      }
    }

    // Upload all files
    const uploadPromises = req.files.map(async (file) => {
      const fileName = generateFileName(file.originalname, req.user.userId, type);
      const fileUrl = await uploadToS3(file, fileName);
      
      return {
        url: fileUrl,
        fileName,
        fileSize: file.size,
        mimeType: file.mimetype,
        originalName: file.originalname
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);
    
    logger.info(`${uploadedFiles.length} files uploaded by user ${req.user.userId}`);
    
    res.json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles
    });

  } catch (error) {
    logger.error('Error uploading multiple files:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size must be less than 50MB'
      });
    }
    
    res.status(500).json({
      error: 'Upload failed',
      message: 'An error occurred while uploading the files'
    });
  }
});

// Delete file
router.delete('/delete', async (req, res) => {
  try {
    const { fileName, url } = req.body;
    
    if (!fileName && !url) {
      return res.status(400).json({
        error: 'Missing parameter',
        message: 'Please provide fileName or url'
      });
    }

    let keyToDelete = fileName;
    
    // Extract key from URL if fileName not provided
    if (!keyToDelete && url) {
      const urlParts = url.split('/');
      keyToDelete = urlParts.slice(-3).join('/'); // Get last 3 parts (type/userId/filename)
    }

    // Verify the file belongs to the user (security check)
    if (!keyToDelete.includes(req.user.userId)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own files'
      });
    }

    // Delete from S3
    const deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: keyToDelete,
    };

    await s3.deleteObject(deleteParams).promise();
    
    logger.info(`File deleted: ${keyToDelete} by user ${req.user.userId}`);
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting file:', error);
    res.status(500).json({
      error: 'Deletion failed',
      message: 'An error occurred while deleting the file'
    });
  }
});

// Get signed URL for private file access
router.get('/signed-url/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const { expiresIn = 3600 } = req.query; // Default 1 hour
    
    // Verify the file belongs to the user
    if (!fileName.includes(req.user.userId)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only access your own files'
      });
    }

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Expires: parseInt(expiresIn),
    };

    const signedUrl = s3.getSignedUrl('getObject', params);
    
    res.json({
      success: true,
      signedUrl,
      expiresIn: parseInt(expiresIn)
    });

  } catch (error) {
    logger.error('Error generating signed URL:', error);
    res.status(500).json({
      error: 'Failed to generate signed URL',
      message: 'An error occurred while generating the signed URL'
    });
  }
});

// Get user's uploaded files
router.get('/my-files', async (req, res) => {
  try {
    const { type, limit = 50 } = req.query;
    
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: type ? `${type}/${req.user.userId}/` : `media/${req.user.userId}/`,
      MaxKeys: parseInt(limit),
    };

    const result = await s3.listObjectsV2(params).promise();
    
    const files = result.Contents.map(file => ({
      fileName: file.Key,
      url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.Key}`,
      size: file.Size,
      lastModified: file.LastModified,
    }));
    
    res.json({
      success: true,
      files,
      totalCount: result.KeyCount,
      isTruncated: result.IsTruncated
    });

  } catch (error) {
    logger.error('Error fetching user files:', error);
    res.status(500).json({
      error: 'Failed to fetch files',
      message: 'An error occurred while fetching your files'
    });
  }
});

module.exports = router;