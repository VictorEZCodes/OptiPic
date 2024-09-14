import { NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req) {
  const formData = await req.formData();
  const files = formData.getAll('images');
  const quality = parseInt(formData.get('quality'));
  const maxWidth = parseInt(formData.get('maxWidth'));
  const maxHeight = parseInt(formData.get('maxHeight'));
  const addSuffix = formData.get('addSuffix') === 'true';
  const suffix = formData.get('suffix');
  const format = formData.get('format');

  const compressedImages = await Promise.all(
    files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = file.name;
      const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));

      let sharpImage = sharp(buffer);
      const metadata = await sharpImage.metadata();

      if (metadata.width > maxWidth || metadata.height > maxHeight) {
        sharpImage = sharpImage.resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      let compressedBuffer;
      let newFileName;

      switch (format) {
        case 'png':
          compressedBuffer = await sharpImage.png({ quality: quality }).toBuffer();
          newFileName = addSuffix ? `${fileNameWithoutExt}${suffix}.png` : `${fileNameWithoutExt}.png`;
          break;
        case 'webp':
          compressedBuffer = await sharpImage.webp({ quality: quality }).toBuffer();
          newFileName = addSuffix ? `${fileNameWithoutExt}${suffix}.webp` : `${fileNameWithoutExt}.webp`;
          break;
        case 'jpeg':
        default:
          compressedBuffer = await sharpImage.jpeg({ quality: quality }).toBuffer();
          newFileName = addSuffix ? `${fileNameWithoutExt}${suffix}.jpg` : `${fileNameWithoutExt}.jpg`;
          break;
      }

      return {
        name: newFileName,
        buffer: compressedBuffer
      };
    })
  );

  return NextResponse.json({ compressedImages });
}