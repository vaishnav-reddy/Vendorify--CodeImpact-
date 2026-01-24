#!/usr/bin/env node

/**
 * Simple script to help clear authentication data
 * This creates an HTML file that can be opened in the browser to clear localStorage
 */

const fs = require('fs');
const path = require('path');

const clearAuthHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Clear Vendorify Auth Data</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .container { max-width: 400px; margin: 0 auto; }
        button { padding: 15px 30px; font-size: 16px; margin: 10px; cursor: pointer; }
        .success { color: green; font-weight: bold; }
        .info { color: blue; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Vendorify Auth Cleaner</h1>
        <p>Click the button below to clear all authentication data:</p>
        
        <button onclick="clearAuth()" style="background: #ff4444; color: white; border: none; border-radius: 5px;">
            Clear Auth Data
        </button>
        
        <button onclick="showData()" style="background: #4444ff; color: white; border: none; border-radius: 5px;">
            Show Current Data
        </button>
        
        <div id="result" style="margin-top: 20px;"></div>
        
        <script>
            function clearAuth() {
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('vendorify_')) {
                        keysToRemove.push(key);
                    }
                }
                
                keysToRemove.forEach(key => localStorage.removeItem(key));
                
                document.getElementById('result').innerHTML = 
                    '<div class="success">✓ Cleared ' + keysToRemove.length + ' items</div>' +
                    '<p>You can now close this tab and refresh your Vendorify app.</p>';
            }
            
            function showData() {
                let html = '<div class="info">Current localStorage data:</div><ul style="text-align: left;">';
                let hasVendorifyData = false;
                
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('vendorify_')) {
                        hasVendorifyData = true;
                        html += '<li><strong>' + key + '</strong>: ' + localStorage.getItem(key).substring(0, 50) + '...</li>';
                    }
                }
                
                if (!hasVendorifyData) {
                    html += '<li>No Vendorify data found</li>';
                }
                
                html += '</ul>';
                document.getElementById('result').innerHTML = html;
            }
            
            // Auto-show data on load
            showData();
        </script>
    </div>
</body>
</html>
`;

const outputPath = path.join(__dirname, 'clear-auth-data.html');
fs.writeFileSync(outputPath, clearAuthHTML);

console.log('✓ Created clear-auth-data.html');
console.log('📖 Open this file in your browser to clear authentication data');
console.log('📁 File location:', outputPath);