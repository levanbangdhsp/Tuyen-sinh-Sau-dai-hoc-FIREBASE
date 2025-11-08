
import React, { useState } from 'react';
import type { DocumentFile } from '../../types';
import { analyzeStatementOfPurpose } from '../../services/geminiService';

interface Documents {
  statementOfPurpose: string;
  resume: DocumentFile;
  transcripts: DocumentFile;
  recommendationLetter1: DocumentFile;
}

interface StepDocumentsProps {
  documents: Documents;
  onUpdate: (documents: Documents) => void;
}

const FileUpload: React.FC<{ label: string; id: keyof Omit<Documents, 'statementOfPurpose'>; document: DocumentFile; onFileChange: (id: keyof Omit<Documents, 'statementOfPurpose'>, file: File | null) => void; }> = ({ label, id, document, onFileChange }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700">{label}</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                        <label htmlFor={id} className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>Tải lên một tệp</span>
                            <input id={id} name={id} type="file" className="sr-only" onChange={(e) => onFileChange(id, e.target.files ? e.target.files[0] : null)} accept=".pdf,.doc,.docx" />
                        </label>
                        <p className="pl-1">hoặc kéo và thả</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOCX lên đến 10MB</p>
                    {document.name && <p className="text-sm text-green-600 font-semibold pt-2">Đã tải lên: {document.name}</p>}
                </div>
            </div>
        </div>
    );
};

const StepDocuments: React.FC<StepDocumentsProps> = ({ documents, onUpdate }) => {
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSOPChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...documents, statementOfPurpose: e.target.value });
  };

  const handleFileChange = (id: keyof Omit<Documents, 'statementOfPurpose'>, file: File | null) => {
    onUpdate({ ...documents, [id]: { file, name: file?.name || '' } });
  };

  const handleAnalyze = async () => {
    if (!documents.statementOfPurpose.trim()) {
      setAnalysis('Vui lòng viết tuyên bố mục đích của bạn trước khi phân tích.');
      return;
    }
    setIsLoading(true);
    setAnalysis('');
    const result = await analyzeStatementOfPurpose(documents.statementOfPurpose);
    setAnalysis(result);
    setIsLoading(false);
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Tài liệu nộp</h2>
      <p className="text-slate-600 mb-6">Tải lên các tài liệu cần thiết và tuyên bố mục đích của bạn.</p>

      <div className="space-y-8">
        <div>
          <label htmlFor="statementOfPurpose" className="block text-sm font-medium text-slate-700">Tuyên bố Mục đích</label>
          <p className="text-xs text-slate-500 mb-1">Viết một bài luận thuyết phục về lý do tại sao bạn phù hợp với chương trình này.</p>
          <textarea
            id="statementOfPurpose"
            rows={10}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={documents.statementOfPurpose}
            onChange={handleSOPChange}
            placeholder="Bắt đầu viết ở đây..."
          />
          <div className="mt-3 flex items-start space-x-4">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                {isLoading ? 'Đang phân tích...' : 'Phân tích bằng AI'}
              </button>
              {analysis && (
                <div className="flex-1 p-4 bg-slate-100 rounded-md text-sm text-slate-700 border border-slate-200">
                    <h4 className="font-bold mb-2">Phản hồi từ AI:</h4>
                    <div className="whitespace-pre-wrap font-sans">{analysis}</div>
                </div>
              )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FileUpload label="Sơ yếu lý lịch / CV" id="resume" document={documents.resume} onFileChange={handleFileChange} />
            <FileUpload label="Bảng điểm" id="transcripts" document={documents.transcripts} onFileChange={handleFileChange} />
            <FileUpload label="Thư giới thiệu" id="recommendationLetter1" document={documents.recommendationLetter1} onFileChange={handleFileChange} />
        </div>

      </div>
    </div>
  );
};

export default StepDocuments;