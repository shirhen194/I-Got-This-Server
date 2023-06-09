const fs = require('fs');
const path = require('path');

const appDir = path.resolve(__dirname, 'app');
const distDir = path.resolve(__dirname, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

const app = require(path.join(appDir, 'server.js'));

app.listen(3000, () => {
  console.log('App listening on port 3000');
});