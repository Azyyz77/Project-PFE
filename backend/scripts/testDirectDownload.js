const axios = require('axios');
const path = require('path');
const fs = require('fs');

const API_BASE = 'http://localhost:3000/api';

async function testDirectDownload() {
  console.log('🧪 Testing Direct File Download...\n');

  // Get a file from uploads directory
  const uploadsDir = path.join(__dirname, '../uploads');
  const files = fs.readdirSync(uploadsDir);
  
  if (files.length === 0) {
    console.log('❌ No files found in uploads directory');
    return;
  }

  const testFile = files[0];
  console.log('Test file:', testFile);

  try {
    // Test 1: Direct file access (should work)
    console.log('1. Testing direct file access');
    const filePath = path.join(uploadsDir, testFile);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log('✅ File exists:', testFile, `(${stats.size} bytes)`);
    } else {
      console.log('❌ File does not exist:', testFile);
    }

    // Test 2: Test download endpoint with mock database response
    console.log('\n2. Testing download endpoint structure');
    
    // Create a simple test server endpoint
    const express = require('express');
    const app = express();
    
    app.get('/test-download/:filename', (req, res) => {
      const filename = req.params.filename;
      const filePath = path.resolve(uploadsDir, filename);
      
      console.log('Requested file:', filename);
      console.log('Full path:', filePath);
      console.log('File exists:', fs.existsSync(filePath));
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.sendFile(filePath);
    });
    
    const server = app.listen(3001, () => {
      console.log('Test server started on port 3001');
      
      // Test the download
      setTimeout(async () => {
        try {
          const response = await axios.get(`http://localhost:3001/test-download/${testFile}`, {
            responseType: 'stream'
          });
          console.log('✅ Test download successful');
          console.log('Content-Type:', response.headers['content-type']);
          console.log('Content-Disposition:', response.headers['content-disposition']);
        } catch (error) {
          console.log('❌ Test download failed:', error.message);
        }
        
        server.close();
      }, 1000);
    });

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDirectDownload();