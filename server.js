import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

function cleanSupabaseUrl(url) {
  if (!url) return '';
  url = url.trim();
  
  // Try to find a match for any Supabase project URL: https://xxxx.supabase.co
  const supabaseMatch = url.match(/https?:\/\/[a-z0-9-]+\.supabase\.(co|net|com)/i);
  if (supabaseMatch) {
    return supabaseMatch[0].toLowerCase();
  }
  
  // If no Supabase domain, but there's a URL in there, extract the origin of the first valid URL
  const anyUrlMatch = url.match(/https?:\/\/[^\s/]+/i);
  if (anyUrlMatch) {
    return anyUrlMatch[0].toLowerCase();
  }
  
  return url;
}

// Endpoint to provide public config to the frontend
app.get('/api/config', (req, res) => {
  const url = cleanSupabaseUrl(process.env.SUPABASE_URL || 'https://iswxswoypxyflahrwmgh.supabase.co');

  res.json({
    supabaseUrl: url,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'sb_publishable_tmoF1hgQGT_-bj0MNEuj8Q_Vcyz1qNy'
  });
});

// Map default route to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
