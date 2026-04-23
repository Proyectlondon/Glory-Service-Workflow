const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportData() {
  console.log('🚀 Iniciando exportación de datos para SharePoint...');
  
  try {
    // 1. Exportar Workflows (Lista Padre)
    const workflows = await prisma.workflow.findMany({
      include: {
        fields: true
      }
    });

    console.log(`📦 Encontrados ${workflows.length} flujos.`);

    // CSV para FlujosDeTrabajo (Padre)
    let workflowCsv = 'Title,Estado,AreaActual,FechaCreacion,DocumentoOriginal\n';
    
    // CSV para CamposDelFlujo (Hijo)
    let fieldsCsv = 'FlujoTitle,Etiqueta,Valor,Area,TipoDeCampo,Orden\n';

    for (const w of workflows) {
      const sanitizedName = w.name.replace(/,/g, ' ');
      workflowCsv += `"${sanitizedName}","${w.status}","${w.currentArea}","${w.createdAt.toISOString()}","${w.documentName}"\n`;

      for (const f of w.fields) {
        const sanitizedLabel = f.label.replace(/,/g, ' ');
        const sanitizedValue = (f.value || '').replace(/"/g, '""').replace(/,/g, ' ');
        fieldsCsv += `"${sanitizedName}","${sanitizedLabel}","${sanitizedValue}","${f.area}","${f.fieldType}",${f.orderIndex}\n`;
      }
    }

    fs.writeFileSync(path.join(__dirname, 'SharePoint_Workflows.csv'), workflowCsv);
    fs.writeFileSync(path.join(__dirname, 'SharePoint_Fields.csv'), fieldsCsv);

    console.log('✅ Exportación completada exitosamente.');
    console.log('📂 Archivos generados:');
    console.log('   - SharePoint_Workflows.csv (Importar a lista principal)');
    console.log('   - SharePoint_Fields.csv (Importar a lista de campos)');

  } catch (error) {
    console.error('❌ Error durante la exportación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
