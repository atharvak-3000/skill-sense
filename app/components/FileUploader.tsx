import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export function formatSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;
  if (bytes >= GB) return `${(bytes / GB).toFixed(2)} GB`;
  if (bytes >= MB) return `${(bytes / MB).toFixed(2)} MB`;
  return `${(bytes / KB).toFixed(2)} KB`;
}

interface FileUploaderProps {
  onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0] || null;
    setSelectedFile(file);
    onFileSelect?.(file);
  }, [onFileSelect]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 20 * 1024 * 1024
  });

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening file dialog
    setSelectedFile(null);
    onFileSelect?.(null);
  };

  return (
    <div className="w-full gradient-border">
      <div {...getRootProps()} className="p-4">
        <input {...getInputProps()} />
        <div className="space-y-4 cursor-pointer">
          {selectedFile ? (
            <div className="uploader-selected-file flex items-center justify-between p-3 bg-gray-50 rounded-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center space-x-3">
                <img src="/images/pdf.png" alt="upload" className="size-12" />
                <div>
                  <p className="text-sm font-medium text-gray-700 truncate max-w-xs">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{formatSize(selectedFile.size)}</p>
                </div>
              </div>
              <button
                type="button"
                className="p-2 hover:bg-gray-200 rounded-full"
                onClick={handleRemoveFile}
              >
                <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 flex items-center justify-center">
                <img src="/icons/info.svg" alt="upload-icon" className="size-12" />
              </div>
              <p className="text-lg text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-lg text-gray-500">PDF (max 20 MB)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
