const fs = require('fs');
const path = require('path');

// Professional design system template
const designSystem = {
  overlay: `  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95), 
    rgba(30, 41, 59, 0.98)
  );
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 2rem;
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);`,

  popup: `  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.95), 
    rgba(248, 250, 252, 0.98)
  );
  border-radius: 1.5rem;
  box-shadow: 
    0 32px 64px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  max-width: 70rem;
  min-height: 550px;
  height: auto;
  width: 100%;
  margin: 0 1rem;
  position: relative;
  padding: 0;
  overflow: hidden;
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  backdrop-filter: blur(10px);`,

  closeButton: `  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: linear-gradient(135deg, 
    #dc2626 0%, 
    #ef4444 50%, 
    #f87171 100%
  );
  border: 2px solid rgba(255, 255, 255, 0.95);
  cursor: pointer;
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 40;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 6px 20px rgba(220, 38, 38, 0.25),
    0 3px 10px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);`,

  closeButtonHover: `  background: linear-gradient(135deg, 
    #b91c1c 0%, 
    #dc2626 50%, 
    #ef4444 100%
  );
  transform: scale(1.1);
  box-shadow: 
    0 8px 25px rgba(220, 38, 38, 0.35),
    0 4px 15px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);`,

  backButton: `  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95), 
    rgba(248, 250, 252, 0.98)
  );
  border: 2px solid rgba(226, 232, 240, 0.8);
  cursor: pointer;
  color: #475569;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: 0.025em;`,

  backButtonHover: `  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 1), 
    rgba(241, 245, 249, 1)
  );
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 
    0 6px 16px rgba(59, 130, 246, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  color: #1e293b;`,

  header: `  background: linear-gradient(135deg, 
    rgba(248, 250, 252, 0.95), 
    rgba(241, 245, 249, 0.98)
  );
  padding: 1rem 2rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  flex-shrink: 0;
  min-height: 70px;
  backdrop-filter: blur(10px);`,

  headerText: `  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 700;
  background: linear-gradient(135deg, #1e293b, #475569);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1.2rem;
  letter-spacing: -0.025em;
  text-align: center;
  position: relative;
  flex: 1;`
};

// Function to update CSS file
function updateCSSFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Update overlay
    content = content.replace(
      /\.overlay\s*\{[\s\S]*?background:.*?rgba\(0,\s*0,\s*0,\s*0\.8\).*?rgba\(0,\s*0,\s*0,\s*0\.9\)[\s\S]*?\}/,
      `.overlay {\n${designSystem.overlay}\n}`
    );
    
    // Update popup
    content = content.replace(
      /\.popup\s*\{[\s\S]*?background:\s*white[\s\S]*?border-radius:\s*1rem[\s\S]*?\}/,
      `.popup {\n${designSystem.popup}\n}`
    );
    
    // Update close button
    content = content.replace(
      /\.closeButton\s*\{[\s\S]*?background:\s*rgba\(255,\s*255,\s*255,\s*0\.9\)[\s\S]*?\}/,
      `.closeButton {\n${designSystem.closeButton}\n}`
    );
    
    // Update close button hover
    content = content.replace(
      /\.closeButton:hover\s*\{[\s\S]*?color:\s*#374151[\s\S]*?\}/,
      `.closeButton:hover {\n${designSystem.closeButtonHover}\n}`
    );
    
    // Update back button
    content = content.replace(
      /\.backButton\s*\{[\s\S]*?background:\s*rgba\(255,\s*255,\s*255,\s*0\.8\)[\s\S]*?\}/,
      `.backButton {\n${designSystem.backButton}\n}`
    );
    
    // Update back button hover
    content = content.replace(
      /\.backButton:hover\s*\{[\s\S]*?color:\s*#475569[\s\S]*?\}/,
      `.backButton:hover {\n${designSystem.backButtonHover}\n}`
    );
    
    // Update header
    content = content.replace(
      /\.header\s*\{[\s\S]*?background:\s*#f8f9fa[\s\S]*?\}/,
      `.header {\n${designSystem.header}\n}`
    );
    
    // Update header text
    content = content.replace(
      /\.headerText\s*\{[\s\S]*?font-family:\s*'DM Sans'[\s\S]*?\}/,
      `.headerText {\n${designSystem.headerText}\n}`
    );
    
    // Add close button pseudo-elements
    if (!content.includes('.closeButton::before')) {
      content = content.replace(
        /\.closeButton\s*\{[\s\S]*?\}/,
        `.closeButton {\n${designSystem.closeButton}\n}

.closeButton::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 18px;
  height: 2px;
  background: white;
  transform: translate(-50%, -50%) rotate(45deg);
  transition: all 0.3s ease;
}

.closeButton::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 18px;
  height: 2px;
  background: white;
  transform: translate(-50%, -50%) rotate(-45deg);
  transition: all 0.3s ease;
}

.closeButton:hover::before {
  transform: translate(-50%, -50%) rotate(225deg);
  width: 20px;
}

.closeButton:hover::after {
  transform: translate(-50%, -50%) rotate(135deg);
  width: 20px;
}

.closeButton:active {
  transform: scale(0.95);
  transition: transform 0.1s ease;
}`
      );
    }
    
    // Add header text underline
    if (!content.includes('.headerText::after')) {
      content = content.replace(
        /\.headerText\s*\{[\s\S]*?\}/,
        `.headerText {\n${designSystem.headerText}\n}

.headerText::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 1px;
}`
      );
    }
    
    // Add popup hover effect
    if (!content.includes('.popup:hover')) {
      content = content.replace(
        /\.popup\s*\{[\s\S]*?\}/,
        `.popup {\n${designSystem.popup}\n}

.popup:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 40px 80px -16px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}`
      );
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

// Get all CSS files
const cssDir = path.join(__dirname, 'src', 'component', 'css');
const cssFiles = fs.readdirSync(cssDir)
  .filter(file => file.endsWith('.css'))
  .map(file => path.join(cssDir, file));

// Update all files
cssFiles.forEach(updateCSSFile);

console.log('CSS files updated successfully!');

