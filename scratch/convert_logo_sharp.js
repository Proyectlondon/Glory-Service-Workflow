const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// The original JPEG base64 from lib/logo_base64.ts (just a part of it to verify)
const jpegBase64 = "/9j/4QqtRXhpZgAATU0AKgAAAAgADAEAAAMAAAABBgIAAAEBAAMAAAABAjcAAAECAAMAAAADAAAAngEGAAMAAAABAAIAAAESAAMAAAABAAEAAAEVAAMAAAABAAMAAAEaAAUAAAABAAAApAEbAAUAAAABAAAArAEoAAMAAAABAAIAAAExAAIAAAAkAAAAtAEyAAIAAAAUAAAA2IdpAAQAAAABAAAA7AAAASQACAAIAAgAW42AAAAnEABbjYAAACcQQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkAMjAxODowNjoxNCAxMToxMzoxNgAABJAAAAcAAAAEMDIyMaABAAMAAAABAAEAAKACAAQAAAABAAAGAqADAAQAAAABAAACNQAAAAAAAAAGAQMAAwAAAAEABgAAARoABQAAAAEAAAFyARsABQAAAAEAAAF6ASgAAwAAAAEAAgAAAgEABAAAAAEAAAGCAgIABAAAAAEAAAkjAAAAAAAAAEgAAAABAAAASAAAAAH/2P/tAAxBZG9iZV9DTQAB/+4ADkFkb2JlAGSAAAAAAf/bAIQADAgICAkIDAkJDBELCgsRFQ8MDA8VGBMTFRMTGBEMDAwMDAwRDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAENCwsNDg0QDg4QFA4ODhQUDg4ODhQRDAwMDAwREQwMDAwMDBEMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwM/8AAEQgAOwCgAwEiAAIRAQMRAf/dAAQACv/EAT8AAAEFAQEBAQEBAAAAAAAAAAMAAQIEBQYHCAkKCwEAAQUBAQEBAQEAAAAAAAAAAQACAdv... (truncated)";

// Since I have the file locally, I'll just read it from the lib file
const logoFileContent = fs.readFileSync(path.join(__dirname, '../src/lib/logo_base64.ts'), 'utf8');
const match = logoFileContent.match(/CORPORATE_LOGO_BASE64 = "([^"]+)"/);
if (!match) {
    console.error("Could not find logo base64 in lib file");
    process.exit(1);
}

const originalBase64 = match[1];

sharp(Buffer.from(originalBase64, 'base64'))
    .png()
    .resize(300) // Scale down to 300px width for better compatibility and smaller size
    .toBuffer()
    .then(buffer => {
        const pngBase64 = buffer.toString('base64');
        console.log("PNG_BASE64_START");
        console.log(pngBase64);
        console.log("PNG_BASE64_END");
    })
    .catch(err => {
        console.error("Error converting logo:", err);
    });
