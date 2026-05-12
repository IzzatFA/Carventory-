require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 6767,
  
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET || 'car-images',
  
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173'
};

// Validate required environment variables
const requiredEnvs = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'];

const missingEnvs = requiredEnvs.filter(key => !env[key]);

if (missingEnvs.length > 0) {
  console.error(`[ERROR] Missing required environment variables: ${missingEnvs.join(', ')}`);
  process.exit(1);
}

module.exports = env;
