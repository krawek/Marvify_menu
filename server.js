const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files like images or fonts
app.use(express.static(path.join(__dirname, 'public')));

// Main SSR route for restaurants
app.get('/:restaurantId', (req, res) => {
  const restaurantId = req.params.restaurantId;
  const jsonPath = path.join(__dirname, 'data', `${restaurantId}.json`);

  // Check if the JSON file exists
  if (!fs.existsSync(jsonPath)) {
    return res.status(404).send('Restaurant data not found.');
  }

  // Load JSON config
  let config;
  try {
    const configRaw = fs.readFileSync(jsonPath, 'utf-8');
    config = JSON.parse(configRaw);
  } catch (err) {
    return res.status(500).send('Invalid JSON format.');
  }

  // Determine which HTML template to use
  const templateId = config.template || '1';
  const htmlPath = path.join(__dirname, 'public', `template${templateId}.html`);
  if (!fs.existsSync(htmlPath)) {
    return res.status(500).send('Template file not found.');
  }

  let html = fs.readFileSync(htmlPath, 'utf-8');

  // Inject config JSON into the head at the CONFIG_INJECTION_POINT
  const scriptTag = `<script>window.__INITIAL_CONFIG__ = ${JSON.stringify(config, null, 2)};</script>`;
  html = html.replace('<!-- CONFIG_INJECTION_POINT -->', scriptTag);

  res.send(html);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
