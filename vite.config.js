import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      {
        name: 'api-submit-review-middleware',
        configureServer(server) {
          server.middlewares.use('/api/submit-review', async (req, res) => {
            if (req.method === 'OPTIONS') {
              res.writeHead(200, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
              });
              res.end();
              return;
            }
            if (req.method !== 'POST') {
              res.writeHead(405, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Method Not Allowed' }));
              return;
            }

            let bodyStr = '';
            req.on('data', (chunk) => {
              bodyStr += chunk;
            });
            req.on('end', async () => {
              try {
                const body = JSON.parse(bodyStr || '{}');
                const { default: handler } = await import('./api/submit-review.js');
                process.env.WIX_API_KEY = process.env.WIX_API_KEY || env.WIX_API_KEY;
                process.env.WIX_SITE_ID = process.env.WIX_SITE_ID || env.WIX_SITE_ID;
                process.env.WIX_ACCOUNT_ID = process.env.WIX_ACCOUNT_ID || env.WIX_ACCOUNT_ID;
                
                const mockReq = { method: 'POST', body };
                const mockRes = {
                  setHeader: (k, v) => res.setHeader(k, v),
                  status: (code) => {
                    res.statusCode = code;
                    return {
                      json: (data) => {
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(data));
                      },
                      end: () => res.end(),
                    };
                  },
                };
                await handler(mockReq, mockRes);
              } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          });
        },
      },
    ],
  };
});
