export interface PdfConversionResult {
  imageUrl: string;
  file: File;
}

let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
  loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
    lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    pdfjsLib = lib;
    return lib;
  });

  return loadPromise;
}

export async function convertPdfToImage(file: File): Promise<PdfConversionResult> {
  if (!file || file.type !== "application/pdf") {
    throw new Error("Invalid file. Please provide a PDF file.");
  }

  const lib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await lib.getDocument({ data: arrayBuffer }).promise;

  if (pdf.numPages < 1) {
    throw new Error("PDF has no pages.");
  }

  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 4 });

  if (viewport.width === 0 || viewport.height === 0) {
    throw new Error("Invalid PDF page dimensions.");
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Failed to get 2D canvas context.");
  }

  canvas.width = viewport.width;
  canvas.height = viewport.height;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  await page.render({ canvasContext: context, viewport }).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create image blob from PDF."));
          return;
        }

        const originalName = file.name.replace(/\.pdf$/i, "");
        const imageFile = new File([blob], `${originalName}.png`, { type: "image/png" });

        resolve({
          imageUrl: URL.createObjectURL(blob),
          file: imageFile,
        });
      },
      "image/png",
      1.0
    );
  });
}
