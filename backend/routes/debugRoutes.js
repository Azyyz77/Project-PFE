const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Debug endpoint to test file downloads
router.get('/test-download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const uploadsDir = path.join(__dirname, '../uploads');
    const filePath = path.resolve(uploadsDir, filename);
    
    console.log('Debug download request:');
    console.log('- Filename:', filename);
    console.log('- Uploads dir:', uploadsDir);
    console.log('- Full path:', filePath);
    console.log('- File exists:', fs.existsSync(filePath));
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
        debug: {
          filename,
          uploadsDir,
          filePath,
          exists: false
        }
      });
    }
    
    const stats = fs.statSync(filePath);
    console.log('- File size:', stats.size);
    
    // Set headers for download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', stats.size);
    
    // Send file
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      } else {
        console.log('File sent successfully');
      }
    });
    
  } catch (error) {
    console.error('Debug download error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// List available files for testing
router.get('/list-files', (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      return res.json({
        success: true,
        files: [],
        message: 'Uploads directory does not exist'
      });
    }
    
    const files = fs.readdirSync(uploadsDir).map(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        size: stats.size,
        modified: stats.mtime,
        downloadUrl: `/api/debug/test-download/${filename}`
      };
    });
    
    res.json({
      success: true,
      files,
      uploadsDir
    });
    
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({
      success: false,
      message: 'Error listing files',
      error: error.message
    });
  }
});

module.exports = router;