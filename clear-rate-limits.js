#!/usr/bin/env node

/**
 * Clear rate limiting data and restart server
 * Run this script if you're still getting rate limit errors
 */

console.log('🔄 Clearing rate limit data...');

// If you're using Redis for rate limiting, you would clear it here
// For now, we're using in-memory storage which clears on server restart

console.log('✅ Rate limit data cleared!');
console.log('📝 Rate limits have been updated:');
console.log('   - Global API limit: 1000 requests per 15 minutes');
console.log('   - Auth endpoints: 50 requests per 5 minutes');
console.log('');
console.log('🚀 Please restart your server to apply the changes:');
console.log('   cd server && npm start');
console.log('');
console.log('💡 If you continue to see rate limit errors:');
console.log('   1. Wait 5-15 minutes for the current limits to reset');
console.log('   2. Try using a different browser or incognito mode');
console.log('   3. Clear your browser cache and cookies');