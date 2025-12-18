const mongoose = require('mongoose');
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

const connectDB = async () => {
   try {
      await mongoose.connect(
         `mongodb+srv://${dbUser}:${dbPassword}@cluster0.irye5zr.mongodb.net/?appName=Cluster0`
      );
      console.log('MongoDB connected successfully.');
   } catch (error) {
      console.error('MongoDB connection error:', error);
      process.exit(1);
   }
};

connectDB();

module.exports = mongoose;
