const pptxgen = require('pptxgenjs');
const html2pptx = require('/home/z/my-project/skills/ppt/scripts/html2pptx');
const path = require('path');

async function main() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  const fontConfig = { cjk: 'Microsoft YaHei', latin: 'Corbel' };
  const slidesDir = '/home/z/my-project/workspace/slides';
  const slideFiles = [
    'slide01-cover.html',
    'slide02-que-es.html',
    'slide03-como-iniciar.html',
    'slide04-flujo-dispatcher.html',
    'slide05-ejecutiva-hub.html',
    'slide06-dependencias.html',
    'slide07-devolver.html',
    'slide08-editar-campos.html',
    'slide09-completar.html',
    'slide10-tips.html'
  ];

  const allWarnings = [];
  for (const file of slideFiles) {
    const htmlPath = path.join(slidesDir, file);
    console.log(`Processing: ${file}`);
    const { slide, placeholders, warnings } = await html2pptx(htmlPath, pptx, { fontConfig });
    if (warnings.length > 0) {
      console.warn(`  Warnings for ${file}:`, warnings);
    }
    allWarnings.push(...warnings);
  }

  const outPath = '/home/z/my-project/download/Glory_Service_Workflow_Instructivo.pptx';
  await pptx.writeFile({ fileName: outPath });
  console.log(`Saved to: ${outPath}`);
  if (allWarnings.length > 0) {
    console.warn(`Total warnings: ${allWarnings.length}`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
