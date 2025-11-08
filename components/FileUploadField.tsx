import React, { useState, useRef } from 'react';
import { User } from '../types';
import { storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import UploadIcon from './icons/UploadIcon';
import TrashIcon from './icons/TrashIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import CheckCircleSolidIcon from './icons/CheckCircleSolidIcon';
import ExclamationCircleSolidIcon from './icons/ExclamationCircleSolidIcon';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

// Helper function to extract storage path from a Firebase download URL
const getPathFromUrl = (url: string): string | null => {
    if (!url || !url.includes('firebasestorage.googleapis.com')) {
        return null;
    }
    try {
        const urlObject = new URL(url);
        // The pathname is like /v0/b/bucket-name/o/path%2Fto%2Ffile.jpg
        const path = urlObject.pathname;
        const pathStartString = '/o/';
        const pathStartIndex = path.indexOf(pathStartString);
        
        if (pathStartIndex === -1) return null;
        
        // The actual path is after the bucket name and '/o/'
        const encodedPath = path.substring(pathStartIndex + pathStartString.length);
        return decodeURIComponent(encodedPath);

    } catch (e) {
        console.error("Could not parse URL to get storage path:", e);
        return null;
    }
};


interface FileUploadFieldProps {
  user: User;
  fullName: string; // Use the full name from the form for accuracy
  label: string;
  description: string;
  targetFileName: string;
  value: string;
  onUploadComplete: (url: string) => void;
  onDelete: () => void;
  acceptedFileTypes?: string[];
  maxFileSizeMB?: number;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  user,
  fullName,
  label,
  description,
  targetFileName,
  value,
  onUploadComplete,
  onDelete,
  acceptedFileTypes = ['image/jpeg', 'image/png', 'application/pdf'],
  maxFileSizeMB = 5,
}) => {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fileName, setFileName] = useState('');
  const [lastFile, setLastFile] = useState<File | null>(null); // Store the file for retry
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxFileSizeMB * 1024 * 1024) {
      setErrorMessage(`Lỗi: Tệp không được vượt quá ${maxFileSizeMB}MB.`);
      setStatus('error');
      return;
    }
    if (!acceptedFileTypes.includes(file.type)) {
      setErrorMessage(`Lỗi: Định dạng tệp không hợp lệ. Chỉ chấp nhận: ${acceptedFileTypes.join(', ')}.`);
      setStatus('error');
      return;
    }

    setLastFile(file); // Save the file for a potential retry
    setFileName(file.name);
    uploadFileToFirebase(file);
  };

  const uploadFileToFirebase = async (file: File) => {
    // CRITICAL: Add a guard clause to ensure user ID is present before uploading.
    if (!user || !user.id) {
        setStatus('error');
        setErrorMessage("Lỗi xác thực: Không tìm thấy ID người dùng. Vui lòng tải lại trang và thử lại.");
        console.error("Upload stopped: User ID is missing.");
        return;
    }
      
    setStatus('uploading');
    setErrorMessage('');

    const sanitizedFullName = (fullName || user.fullName || 'user')
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_.-]/g, '');

    const fileExtension = file.name.split('.').pop() || 'tmp';
    const newFileName = `${targetFileName}.${fileExtension}`; 
    const folderPath = `uploads/${user.id}_${sanitizedFullName}`;
    const filePath = `${folderPath}/${newFileName}`;

    const storageRef = ref(storage, filePath);
    const oldFileUrl = value;

    try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        if (oldFileUrl) {
            const oldFilePath = getPathFromUrl(oldFileUrl);
            if (oldFilePath && oldFilePath !== filePath) {
                try {
                    const oldFileRef = ref(storage, oldFilePath);
                    await deleteObject(oldFileRef);
                } catch (deleteError: any) {
                    if (deleteError.code !== 'storage/object-not-found') {
                        console.warn("Could not delete old file after new upload:", deleteError);
                    }
                }
            }
        }
        
        setStatus('success');
        onUploadComplete(downloadURL);
        setLastFile(null); // Clear the file on successful upload

    } catch (uploadError: any) {
        console.error('Firebase Storage upload error:', uploadError);
        setStatus('error');
        let message = 'Tải lên thất bại. Vui lòng thử lại.';
        if (uploadError.code) {
            switch (uploadError.code) {
                case 'storage/unauthorized':
                    message = 'Lỗi: Bạn không có quyền tải tệp lên. Vui lòng liên hệ quản trị viên để kiểm tra quyền truy cập trên Firebase Storage.';
                    break;
                case 'storage/canceled':
                    message = 'Việc tải lên đã bị người dùng hủy.';
                    break;
                case 'storage/retry-limit-exceeded':
                    message = 'Đã hết thời gian chờ. Vui lòng kiểm tra kết nối mạng và thử lại.';
                    break;
                default:
                    message = `Đã xảy ra lỗi không mong muốn. (Mã: ${uploadError.code})`;
            }
        }
        setErrorMessage(message);
    }
  };
  
  const handleRetry = () => {
    if (lastFile) {
      // Reset status and attempt to upload the same file again
      setErrorMessage('');
      uploadFileToFirebase(lastFile);
    }
  };


  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const handleViewFile = () => {
      if(value) window.open(value, '_blank', 'noopener,noreferrer');
  }

  const handleDelete = async () => {
    if (!value) {
      onDelete();
      return;
    }
    
    const filePath = getPathFromUrl(value);
    if (!filePath) {
        setErrorMessage('Không thể xóa file. URL không hợp lệ.');
        setStatus('error');
        console.error("Could not determine file path from URL for deletion:", value);
        return;
    }

    try {
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      onDelete();
      setStatus('idle');
      setErrorMessage('');
      setFileName('');
      setLastFile(null); // Clean up the stored file
    } catch (error: any) {
        if (error.code === 'storage/object-not-found') {
            console.warn("File not found in storage, but clearing link anyway.");
            onDelete();
        } else {
            console.error("Error deleting file from Firebase Storage:", error);
            setErrorMessage('Không thể xóa file. Vui lòng thử lại.');
            setStatus('error');
        }
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex-grow mb-4 md:mb-0">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
            {value ? (
                 <>
                    <button type="button" onClick={handleViewFile} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-colors">
                        Xem file
                    </button>
                    <button type="button" onClick={handleDelete} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </>
            ) : (
                <button
                    type="button"
                    onClick={triggerFileSelect}
                    disabled={status === 'uploading'}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-300 disabled:cursor-wait transition-colors"
                >
                    <UploadIcon className="w-5 h-5" />
                    <span>Chọn file</span>
                </button>
            )}
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept={acceptedFileTypes.join(',')}
            />
        </div>
      </div>
      
      {(status === 'uploading' || status === 'error' || status === 'success') && !value && (
         <div className="mt-3 p-2 bg-white border rounded-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm truncate">
                    {status === 'uploading' && <SpinnerIcon className="w-5 h-5 flex-shrink-0" />}
                    {status === 'success' && <CheckCircleSolidIcon className="w-5 h-5 text-green-500 flex-shrink-0" />}
                    {status === 'error' && <ExclamationCircleSolidIcon className="w-5 h-5 text-red-500 flex-shrink-0" />}
                    <span className="text-gray-700 truncate">{fileName || '...'}</span>
                </div>
                 <span className={`text-sm font-medium ${
                     status === 'uploading' ? 'text-gray-500' :
                     status === 'success' ? 'text-green-600' :
                     'text-red-600'
                 }`}>
                     {status === 'uploading' && 'Đang tải lên...'}
                     {status === 'success' && 'Thành công'}
                     {status === 'error' && 'Thất bại'}
                 </span>
            </div>
            {status === 'error' && errorMessage && (
              <div className="pl-7 mt-1">
                <p className="text-xs text-red-600">{errorMessage}</p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-2 px-3 py-1 text-xs font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            )}
         </div>
      )}

    </div>
  );
};

export default FileUploadField;