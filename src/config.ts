import dotenv  from 'dotenv';
dotenv.config();

const configKeys = {
  PORT: process.env.PORT,
  MONGO_DB_URL:process.env.MONGO_URI as string,
  ACCESS_SECRET:process.env.ACCESS_SECRET as string,
  REFRESH_SECRET:process.env.REFRESH_SECRET as string,
  APP_EMAIL:process.env.APP_EMAIL as string,
  APP_PASSWORD:process.env.APP_PASSWORD as string,
  ADMIN_EMAIL:process.env.ADMIN_EMAIL as string,
  ADMIN_PASSWORD:process.env.ADMIN_PASSWORD as string
};
export default configKeys;
