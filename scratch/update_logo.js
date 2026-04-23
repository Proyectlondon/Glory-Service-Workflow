const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logoFilePath = path.join(__dirname, '../src/lib/logo_base64.ts');
const logoFileContent = fs.readFileSync(logoFilePath, 'utf8');
const match = logoFileContent.match(/CORPORATE_LOGO_BASE64 = "([^"]+)"/);
if (!match) {
    console.error("Could not find logo base64 in lib file");
    process.exit(1);
}

const originalBase64 = match[1];

sharp(Buffer.from(originalBase64, 'base64'))
    .png()
    .resize(300)
    .toBuffer()
    .then(buffer => {
        const pngBase64 = buffer.toString('base64');
        const newContent = `export const CORPORATE_LOGO_BASE64 = "${pngBase64}";\n`;
        fs.writeFileSync(logoFilePath, newContent);
        console.log("Successfully updated logo to PNG in lib file");
    })
    .catch(err => {
        console.error("Error converting logo:", err);
    });
