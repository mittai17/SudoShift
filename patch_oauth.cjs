const fs = require('fs');

const codeToInsert = `
  // GitHub OAuth
  app.get("/api/auth/github/login", (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) return res.status(500).send("GITHUB_CLIENT_ID missing");
    res.redirect(\`https://github.com/login/oauth/authorize?client_id=\${clientId}&scope=repo,read:user\`);
  });

  app.get("/api/auth/github/callback", async (req, res) => {
    const { code } = req.query;
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!code || !clientId || !clientSecret) return res.send(\`<script>window.opener.postMessage({ type: 'GITHUB_AUTH_ERROR', error: 'Missing code or env vars' }, '*'); window.close();</script>\`);
    try {
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
      });
      const data = await response.json();
      if (data.access_token) {
        res.send(\`<script>window.opener.postMessage({ type: 'GITHUB_AUTH_SUCCESS', token: '\${data.access_token}' }, '*'); window.close();</script>\`);
      } else {
        res.send(\`<script>window.opener.postMessage({ type: 'GITHUB_AUTH_ERROR', error: 'Failed to get token' }, '*'); window.close();</script>\`);
      }
    } catch (e) {
      res.send(\`<script>window.opener.postMessage({ type: 'GITHUB_AUTH_ERROR', error: e.message }, '*'); window.close();</script>\`);
    }
  });

  // Slack OAuth
  app.get("/api/auth/slack/login", (req, res) => {
    const clientId = process.env.SLACK_CLIENT_ID;
    if (!clientId) return res.status(500).send("SLACK_CLIENT_ID missing");
    const host = req.get('host') || '';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirectUri = encodeURIComponent(\`\${protocol}://\${host}/api/auth/slack/callback\`);
    res.redirect(\`https://slack.com/oauth/v2/authorize?client_id=\${clientId}&user_scope=channels:history,channels:read,chat:write&redirect_uri=\${redirectUri}\`);
  });

  app.get("/api/auth/slack/callback", async (req, res) => {
    const { code } = req.query;
    const clientId = process.env.SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;
    const host = req.get('host') || '';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirectUri = \`\${protocol}://\${host}/api/auth/slack/callback\`;
    if (!code || !clientId || !clientSecret) return res.send(\`<script>window.opener.postMessage({ type: 'SLACK_AUTH_ERROR', error: 'Missing code or env vars' }, '*'); window.close();</script>\`);
    try {
      const response = await fetch('https://slack.com/api/oauth.v2.access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri })
      });
      const data = await response.json();
      if (data.ok && data.authed_user?.access_token) {
        res.send(\`<script>window.opener.postMessage({ type: 'SLACK_AUTH_SUCCESS', token: '\${data.authed_user.access_token}' }, '*'); window.close();</script>\`);
      } else if (data.ok && data.access_token) {
        res.send(\`<script>window.opener.postMessage({ type: 'SLACK_AUTH_SUCCESS', token: '\${data.access_token}' }, '*'); window.close();</script>\`);
      } else {
        res.send(\`<script>window.opener.postMessage({ type: 'SLACK_AUTH_ERROR', error: data.error || 'Failed' }, '*'); window.close();</script>\`);
      }
    } catch (e) {
      res.send(\`<script>window.opener.postMessage({ type: 'SLACK_AUTH_ERROR', error: e.message }, '*'); window.close();</script>\`);
    }
  });
`;

let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace('// Stateless Collaboration Logic', codeToInsert + '\n  // Stateless Collaboration Logic');
fs.writeFileSync('server.ts', content);
