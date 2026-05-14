const storage = require('../config/storage');

const storageService = {
  async uploadImage(file, folder = 'cars') {
    return await storage.uploadFile(file, folder);
  },

  async deleteImage(publicUrl) {
    return await storage.deleteFileByUrl(publicUrl);
  }
};

module.exports = storageService;
