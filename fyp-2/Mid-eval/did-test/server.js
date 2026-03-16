// D-ID Avatar Test Server
// Install dependencies: npm install express cors node-fetch@2
// Run: node server.js
// Then open: http://localhost:3000

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const PORT = 3000;

// Serve the HTML page
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>D-ID Avatar Test</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 800px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
            text-align: center;
        }
        
        .subtitle {
            color: #666;
            text-align: center;
            margin-bottom: 30px;
            font-size: 14px;
        }
        
        .input-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: 600;
        }
        
        input, textarea, select {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        
        input:focus, textarea:focus, select:focus {
            outline: none;
            border-color: #667eea;
        }
        
        textarea {
            resize: vertical;
            min-height: 100px;
        }
        
        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        #status {
            margin-top: 20px;
            padding: 12px;
            border-radius: 8px;
            text-align: center;
            font-weight: 500;
            display: none;
        }
        
        #status.loading {
            background: #fff3cd;
            color: #856404;
            display: block;
        }
        
        #status.success {
            background: #d4edda;
            color: #155724;
            display: block;
        }
        
        #status.error {
            background: #f8d7da;
            color: #721c24;
            display: block;
        }
        
        #videoContainer {
            margin-top: 30px;
            text-align: center;
            display: none;
        }
        
        video {
            width: 100%;
            max-width: 600px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .info-box {
            background: #d4edda;
            border-left: 4px solid #28a745;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
            font-size: 13px;
            color: #155724;
        }
        
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 10px auto;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎭 D-ID Avatar Test</h1>
        <p class="subtitle">Running through backend server - No CORS issues!</p>
        
        <div class="info-box">
            <strong>✅ Server Running:</strong> This version uses a Node.js backend to avoid CORS issues.
        </div>
        
        <div class="input-group">
            <label for="apiKey">D-ID API Key</label>
            <input type="password" id="apiKey" placeholder="Enter your D-ID API key">
        </div>
        
        <div class="input-group">
            <label for="voiceId">Voice</label>
            <select id="voiceId">
                <option value="en-US-JennyNeural">English (US) - Jenny (Female)</option>
                <option value="en-US-GuyNeural">English (US) - Guy (Male)</option>
                <option value="en-GB-SoniaNeural">English (UK) - Sonia (Female)</option>
                <option value="en-GB-RyanNeural">English (UK) - Ryan (Male)</option>
            </select>
        </div>
        
        <div class="input-group">
            <label for="textInput">Interview Question / Text to Speak</label>
            <textarea id="textInput">Hello! Welcome to your interview. Can you tell me about yourself and your background?</textarea>
        </div>
        
        <button id="generateBtn" onclick="generateVideo()">Generate Avatar Video</button>
        
        <div id="status"></div>
        
        <div id="videoContainer">
            <video id="videoPlayer" controls></video>
        </div>
    </div>

    <script>
        let pollInterval;
        
        async function generateVideo() {
            const apiKey = document.getElementById('apiKey').value.trim();
            const text = document.getElementById('textInput').value.trim();
            const voiceId = document.getElementById('voiceId').value;
            
            if (!apiKey) {
                showStatus('Please enter your API key', 'error');
                return;
            }
            
            if (!text) {
                showStatus('Please enter text to speak', 'error');
                return;
            }
            
            const btn = document.getElementById('generateBtn');
            btn.disabled = true;
            showStatus('Creating avatar video...', 'loading');
            document.getElementById('videoContainer').style.display = 'none';
            
            try {
                const response = await fetch('/api/create-talk', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        apiKey: apiKey,
                        text: text,
                        voiceId: voiceId
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to create video');
                }
                
                const talkId = data.id;
                showStatus('Video generation in progress... This may take 30-60 seconds', 'loading');
                
                pollForVideo(talkId, apiKey);
                
            } catch (error) {
                showStatus('Error: ' + error.message, 'error');
                btn.disabled = false;
            }
        }
        
        async function pollForVideo(talkId, apiKey) {
            const maxAttempts = 60;
            let attempts = 0;
            
            pollInterval = setInterval(async () => {
                attempts++;
                
                try {
                    const response = await fetch('/api/check-talk', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            apiKey: apiKey,
                            talkId: talkId
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.status === 'done') {
                        clearInterval(pollInterval);
                        showStatus('Video ready!', 'success');
                        displayVideo(data.result_url);
                        document.getElementById('generateBtn').disabled = false;
                    } else if (data.status === 'error') {
                        clearInterval(pollInterval);
                        showStatus('Video generation failed: ' + (data.error || 'Unknown error'), 'error');
                        document.getElementById('generateBtn').disabled = false;
                    } else if (attempts >= maxAttempts) {
                        clearInterval(pollInterval);
                        showStatus('Timeout: Video generation took too long', 'error');
                        document.getElementById('generateBtn').disabled = false;
                    } else {
                        showStatus(\`Processing... (\${attempts * 2}s elapsed)\`, 'loading');
                    }
                } catch (error) {
                    clearInterval(pollInterval);
                    showStatus('Polling error: ' + error.message, 'error');
                    document.getElementById('generateBtn').disabled = false;
                }
            }, 2000);
        }
        
        function displayVideo(videoUrl) {
            const videoContainer = document.getElementById('videoContainer');
            const videoPlayer = document.getElementById('videoPlayer');
            
            videoPlayer.src = videoUrl;
            videoContainer.style.display = 'block';
            videoPlayer.play();
        }
        
        function showStatus(message, type) {
            const status = document.getElementById('status');
            
            if (type === 'loading') {
                status.innerHTML = \`<div class="spinner"></div>\${message}\`;
            } else {
                status.textContent = message;
            }
            
            status.className = type;
            status.style.display = 'block';
        }
    </script>
</body>
</html>
  `);
});

// API endpoint to create a talk
app.post('/api/create-talk', async (req, res) => {
  const { apiKey, text, voiceId } = req.body;
  
  console.log('=== D-ID API Request ===');
  console.log('API Key (first 10 chars):', apiKey.substring(0, 10) + '...');
  console.log('Text length:', text.length);
  console.log('Voice:', voiceId);
  
  try {
    // D-ID API Key format is username:password
    // We need to Base64 encode it for Basic Auth
    let authHeader;
    
    if (apiKey.includes(':')) {
      // Key is in username:password format, encode it
      const base64Credentials = Buffer.from(apiKey).toString('base64');
      authHeader = `Basic ${base64Credentials}`;
      console.log('Using encoded credentials with Basic prefix');
    } else {
      // Key might already be encoded, try both ways
      console.log('Key does not contain ":", trying as-is...');
      authHeader = apiKey.startsWith('Basic ') ? apiKey : `Basic ${apiKey}`;
    }
    
    const requestBody = {
      source_url: 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg',
      script: {
        type: 'text',
        input: text,
        provider: {
          type: 'microsoft',
          voice_id: voiceId
        }
      }
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    console.log('Auth header format:', authHeader.substring(0, 20) + '...');
    
    let response = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('Response status:', response.status);
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response as JSON');
      return res.status(500).json({ 
        error: 'Invalid response from D-ID API',
        details: responseText
      });
    }
    
    if (!response.ok) {
      console.error('❌ D-ID API Error:', data);
      
      let errorMsg = 'D-ID API error';
      if (response.status === 401) {
        errorMsg = 'Invalid API Key - Please check your D-ID dashboard';
      } else if (response.status === 402) {
        errorMsg = 'Payment Required - Check your D-ID account credits';
      } else if (response.status === 403) {
        errorMsg = 'Access Forbidden - Your account may not have access';
      } else if (data.description) {
        errorMsg = data.description;
      } else if (data.message) {
        errorMsg = data.message;
      }
      
      return res.status(response.status).json({ 
        error: errorMsg,
        statusCode: response.status,
        details: data
      });
    }
    
    console.log('✅ Talk created successfully! ID:', data.id);
    res.json(data);
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
});

// API endpoint to check talk status
app.post('/api/check-talk', async (req, res) => {
  const { apiKey, talkId } = req.body;
  
  try {
    const response = await fetch(`https://api.d-id.com/talks/${talkId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${apiKey}`,
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 D-ID Test Server running!`);
  console.log(`📍 Open your browser to: http://localhost:${PORT}\n`);
});