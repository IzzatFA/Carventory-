const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Use memory storage for Multer (since we will upload directly to Supabase)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max size
  }
});

module.exports = upload;
