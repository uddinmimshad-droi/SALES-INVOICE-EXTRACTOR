
import React, { useState, useCallback } from 'react';

interface FileUploadProps {
  onFileChange: (files: File[] | null) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileChange }) => {
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setFileNames(fileArray.map(f => f.name));
      onFileChange(fileArray);
    } else {
      setFileNames([]);
      onFileChange(null);
    }
  }, [onFileChange]);

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <label
        htmlFor="dropzone-file"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-slate-700' : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          <svg className="w-10 h-10 mb-4 text-slate-500 dark:text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
          </svg>
          {fileNames.length > 0 ? (
             <div className="text-center">
                <p className="font-semibold text-blue-600 dark:text-blue-400">
                    {fileNames.length} file{fileNames.length > 1 ? 's' : ''} selected
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-sm mx-auto mt-1">
                    {fileNames.join(', ')}
                </p>
            </div>
          ) : (
            <>
              <p className="mb-2 text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">PDF, DOCX, or CSV (Multiple files supported)</p>
            </>
          )}
        </div>
        <input id="dropzone-file" type="file" className="hidden" onChange={handleInputChange} accept=".pdf,.doc,.docx,.csv" multiple />
      </label>
    </div>
  );
};

export default FileUpload;
