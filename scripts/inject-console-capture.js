const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

async function injectConsoleCapture() {
  try {
    // Find all HTML files in the output directory
    const htmlFiles = await glob('out/**/*.html', { cwd: process.cwd() });
    
    if (htmlFiles.length === 0) {
      console.log('No HTML files found in out directory. Skipping console capture injection.');
      return;
    }

    const scriptContent = fs.readFileSync(
      path.join(process.cwd(), 'public', 'dashboard-console-capture.js'), 
      'utf8'
    );

    let injectedCount = 0;

    for (const file of htmlFiles) {
      const filePath = path.join(process.cwd(), file);
      let content = fs.readFileSync(filePath, 'utf8');

      // Check if script is already injected
      if (content.includes('dashboard-console-capture')) {
        continue;
      }

      // Inject the script inline in the head section
      const headEndIndex = content.indexOf('</head>');
      if (headEndIndex !== -1) {
        const scriptTag = `<script>${scriptContent}</script>\n`;
        content = content.slice(0, headEndIndex) + scriptTag + content.slice(headEndIndex);
        
        fs.writeFileSync(filePath, content);
        injectedCount++;
      }
    }

    console.log(`Console capture script injected into ${injectedCount} HTML files.`);
  } catch (error) {
    console.error('Error injecting console capture script:', error);
  }
}

injectConsoleCapture();