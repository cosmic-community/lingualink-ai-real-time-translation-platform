const fs = require('fs');
const path = require('path');
const glob = require('glob');

const scriptTag = '<script src="/dashboard-console-capture.js"></script>';

function injectConsoleCapture() {
  // Find all HTML files in the build output
  const htmlFiles = glob.sync('**/*.html', { 
    cwd: path.join(process.cwd(), '.next'),
    absolute: true 
  });

  console.log(`Found ${htmlFiles.length} HTML files to process`);

  htmlFiles.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf8');
      
      // Skip if script is already injected
      if (content.includes('/dashboard-console-capture.js')) {
        return;
      }

      // Try to inject before closing head tag, or before closing body tag as fallback
      if (content.includes('</head>')) {
        content = content.replace('</head>', `  ${scriptTag}\n</head>`);
      } else if (content.includes('</body>')) {
        content = content.replace('</body>', `  ${scriptTag}\n</body>`);
      }

      fs.writeFileSync(file, content);
      console.log(`Injected console capture script into: ${path.relative(process.cwd(), file)}`);
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  });

  console.log('Console capture script injection complete');
}

injectConsoleCapture();