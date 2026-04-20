// Test script to verify all route imports work correctly
console.log('🧪 Testing route imports...\n');

try {
  console.log('1. Testing authMiddleware import...');
  const { authMiddleware } = require('../middleware/authMiddleware');
  console.log('   ✅ authMiddleware imported successfully');
  console.log('   Type:', typeof authMiddleware);

  console.log('\n2. Testing uploadMiddleware import...');
  const { upload, handleMulterError, validateEntityParams } = require('../middleware/uploadMiddleware');
  console.log('   ✅ uploadMiddleware imported successfully');
  console.log('   upload type:', typeof upload);
  console.log('   handleMulterError type:', typeof handleMulterError);
  console.log('   validateEntityParams type:', typeof validateEntityParams);

  console.log('\n3. Testing attachmentController import...');
  const attachmentController = require('../controllers/attachmentController');
  console.log('   ✅ attachmentController imported successfully');
  console.log('   Methods:', Object.getOwnPropertyNames(attachmentController).filter(name => typeof attachmentController[name] === 'function'));

  console.log('\n4. Testing attachmentRoutes import...');
  const attachmentRoutes = require('../routes/attachmentRoutes');
  console.log('   ✅ attachmentRoutes imported successfully');
  console.log('   Type:', typeof attachmentRoutes);

  console.log('\n✅ All imports successful! The server should start without errors.');

} catch (error) {
  console.error('❌ Import error:', error.message);
  console.error('Stack:', error.stack);
}