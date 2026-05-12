const supabase = require('./database');
const env = require('./env');
const ApiError = require('../utils/ApiError');

const BUCKET_NAME = env.SUPABASE_STORAGE_BUCKET;

const storage = {
  /**
   * Upload file to Supabase Storage
   * @param {Object} file - Multer file object
   * @param {String} folder - Folder name in bucket (e.g., 'cars')
   * @returns {Promise<String>} - Public URL of the uploaded file
   */
  async uploadFile(file, folder = 'misc') {
    try {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        throw new Error(error.message);
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } catch (error) {
      throw ApiError.internal(`Failed to upload file: ${error.message}`);
    }
  },

  /**
   * Delete file from Supabase Storage by URL
   * @param {String} publicUrl - Public URL of the file
   */
  async deleteFileByUrl(publicUrl) {
    try {
      if (!publicUrl || !publicUrl.includes(BUCKET_NAME)) return;

      const urlParts = publicUrl.split(`${BUCKET_NAME}/`);
      if (urlParts.length !== 2) return;

      const filePath = urlParts[1];
      
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error(`Failed to delete file from storage: ${error.message}`);
      }
    } catch (error) {
      console.error(`Error in deleteFileByUrl: ${error.message}`);
    }
  }
};

module.exports = storage;
