/**
 * Utilidad pura: aplica rotación + recorte con <canvas> y devuelve un File.
 */

export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

export function centeredAspectCropArea(
  width: number,
  height: number,
  aspect: number,
): Area {
  if (width < 1 || height < 1) {
    throw new Error('INVALID_IMAGE');
  }
  const imageAspect = width / height;
  if (imageAspect > aspect) {
    const cropWidth = Math.min(width, height * aspect);
    return {
      x: Math.max(0, (width - cropWidth) / 2),
      y: 0,
      width: cropWidth,
      height,
    };
  }
  const cropHeight = Math.min(height, width / aspect);
  return {
    x: 0,
    y: Math.max(0, (height - cropHeight) / 2),
    width,
    height: cropHeight,
  };
}

function jpegFileNameFromSource(file: File): string {
  return file.name.replace(/\.[^.]+$/, '.jpg') || 'foto.jpg';
}

async function canvasToJpegFile(
  canvas: HTMLCanvasElement,
  fileName: string,
): Promise<File> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.95);
  });
  if (!blob) throw new Error('Canvas is empty');
  return new File([blob], fileName, { type: 'image/jpeg' });
}

export async function getCroppedFile(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  fileName = 'cropped.jpg',
  mimeType = 'image/jpeg'
): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('No 2d context');

  const rotRad = getRadianAngle(rotation);

  // Bounding box del canvas rotado
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  // Canvas de recorte
  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');
  if (!croppedCtx) throw new Error('No 2d context');

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(new File([blob], fileName, { type: mimeType }));
      },
      mimeType,
      0.95
    );
  });
}

export async function cropFileToCenteredAspect(
  file: File,
  aspect: number,
): Promise<File> {
  const fileName = jpegFileNameFromSource(file);

  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      try {
        const area = centeredAspectCropArea(bitmap.width, bitmap.height, aspect);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(area.width));
        canvas.height = Math.max(1, Math.round(area.height));
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('No 2d context');
        ctx.drawImage(
          bitmap,
          area.x,
          area.y,
          area.width,
          area.height,
          0,
          0,
          canvas.width,
          canvas.height,
        );
        return await canvasToJpegFile(canvas, fileName);
      } finally {
        bitmap.close();
      }
    } catch {
      /* fallback */
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const image = await createImage(url);
    const area = centeredAspectCropArea(image.width, image.height, aspect);
    return await getCroppedFile(url, area, 0, fileName, 'image/jpeg');
  } finally {
    URL.revokeObjectURL(url);
  }
}
