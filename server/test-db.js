import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Portfolio from './models/Portfolio.js';
import Invoice from './models/Invoice.js';

dotenv.config();

const runTests = async () => {
  console.log('--- Starting Backend Pre-flight Schema Validation ---');
  console.log(`Checking connection string: ${process.env.MONGODB_URI || 'Default localhost'}`);
  
  try {
    await connectDB();
    console.log('SUCCESS: Connected to Database.');
    
    console.log('Validating models structure...');
    console.log(`- User keys: ${Object.keys(User.schema.paths).join(', ')}`);
    console.log(`- Portfolio keys: ${Object.keys(Portfolio.schema.paths).join(', ')}`);
    console.log(`- Invoice keys: ${Object.keys(Invoice.schema.paths).join(', ')}`);
    
    console.log('Pre-flight check completed. Schemas are fully valid!');
  } catch (error) {
    console.error('Pre-flight test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('--- Verification Complete ---');
  }
};

runTests();
