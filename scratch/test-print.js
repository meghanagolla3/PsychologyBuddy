
async function printToPDF(elementId, filename) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  
  // Copy all styles
  const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
  styles.forEach(style => {
    doc.head.appendChild(style.cloneNode(true));
  });

  // Copy content
  const clone = element.cloneNode(true);
  doc.body.appendChild(clone);

  // Add print-specific styles
  const printStyle = doc.createElement('style');
  printStyle.textContent = `
    @page { size: A4; margin: 20mm; }
    body { background: white !important; margin: 0 !important; padding: 0 !important; }
    #${elementId} { width: 100% !important; border: none !important; box-shadow: none !important; }
  `;
  doc.head.appendChild(printStyle);

  // Wait for styles/images to load
  await new Promise(resolve => setTimeout(resolve, 500));

  iframe.contentWindow.print();
  
  // Cleanup
  setTimeout(() => document.body.removeChild(iframe), 1000);
}
