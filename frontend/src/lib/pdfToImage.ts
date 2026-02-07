/**
 * Converte a primeira página de um PDF em um File de imagem (JPEG)
 * para envio à API de extração de recibo.
 */
import * as pdfjsLib from 'pdfjs-dist';
// Worker do PDF.js: ?url faz o Vite expor o caminho do arquivo
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

if (typeof pdfjsWorker === 'string') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

const JPEG_QUALITY = 0.92;
const MAX_DIMENSION = 2048;

export async function pdfFirstPageToImageFile(pdfFile: File): Promise<File> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1 });
  const scale = Math.min(1, MAX_DIMENSION / Math.max(viewport.width, viewport.height));
  const scaledViewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = scaledViewport.width;
  canvas.height = scaledViewport.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Não foi possível criar contexto do canvas');
  }
  await page.render({
    canvasContext: ctx,
    canvas,
    viewport: scaledViewport,
  }).promise;

  const blob = await new Promise<Blob | null>((resolve, reject) => {
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY);
  });
  if (!blob) {
    throw new Error('Falha ao converter PDF em imagem');
  }

  const baseName = pdfFile.name.replace(/\.pdf$/i, '');
  return new File([blob], `${baseName}_página1.jpg`, { type: 'image/jpeg' });
}

export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf';
}
