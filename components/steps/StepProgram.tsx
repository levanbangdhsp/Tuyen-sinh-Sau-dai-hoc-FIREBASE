
import React from 'react';
import type { Program } from '../../types';
import { PROGRAMS } from '../../constants';

interface StepProgramProps {
  selectedProgram: Program | null;
  onProgramSelect: (program: Program) => void;
}

const StepProgram: React.FC<StepProgramProps> = ({ selectedProgram, onProgramSelect }) => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Chọn chương trình của bạn</h2>
      <p className="text-slate-600 mb-6">Bắt đầu bằng cách chọn chương trình sau đại học bạn muốn đăng ký.</p>
      <div className="space-y-4">
        {PROGRAMS.map((program) => (
          <div
            key={program.id}
            onClick={() => onProgramSelect(program)}
            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 flex items-center space-x-4 ${
              selectedProgram?.id === program.id
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                : 'border-gray-300 hover:border-blue-400 hover:bg-slate-50'
            }`}
          >
            <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${selectedProgram?.id === program.id ? 'text-blue-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    {selectedProgram?.id === program.id ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" style={{opacity: 0.2}} />
                    )}
                </svg>
            </div>
            <div>
                <h3 className="font-bold text-lg text-slate-800">{program.name}</h3>
                <p className="text-sm font-medium text-slate-600">{program.faculty}</p>
                <p className="text-sm text-slate-500 mt-1">{program.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepProgram;