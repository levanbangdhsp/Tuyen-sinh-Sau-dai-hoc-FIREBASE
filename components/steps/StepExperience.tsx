
import React from 'react';
import type { Education, WorkExperience } from '../../types';

interface StepExperienceProps {
  education: Education[];
  workExperience: WorkExperience[];
  onUpdate: (education: Education[], workExperience: WorkExperience[]) => void;
}

const StepExperience: React.FC<StepExperienceProps> = ({ education, workExperience, onUpdate }) => {

  const handleEducationChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newEducation = [...education];
    (newEducation[index] as any)[e.target.name] = e.target.value;
    onUpdate(newEducation, workExperience);
  };

  const addEducation = () => {
    onUpdate([...education, { id: Date.now(), institution: '', degree: '', fieldOfStudy: '', graduationYear: '' }], workExperience);
  };
  
  const removeEducation = (id: number) => {
    onUpdate(education.filter(e => e.id !== id), workExperience);
  };

  const handleWorkChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newWork = [...workExperience];
    (newWork[index] as any)[e.target.name] = e.target.value;
    onUpdate(education, newWork);
  };

  const addWork = () => {
    onUpdate(education, [...workExperience, { id: Date.now(), company: '', position: '', startDate: '', endDate: '', description: '' }]);
  };

  const removeWork = (id: number) => {
    onUpdate(education, workExperience.filter(w => w.id !== id));
  };


  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Học vấn và Kinh nghiệm</h2>
      
      {/* Education Section */}
      <section>
        <h3 className="text-xl font-semibold text-slate-700 mb-4 border-b pb-2">Học vấn</h3>
        {education.map((edu, index) => (
          <div key={edu.id} className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mb-6 p-4 border rounded-md relative bg-slate-50">
            {education.length > 1 && (
                <button type="button" onClick={() => removeEducation(edu.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                </button>
            )}
            <div className="sm:col-span-6"><input type="text" name="institution" placeholder="Tên trường" value={edu.institution} onChange={(e) => handleEducationChange(index, e)} className="w-full border-gray-300 rounded-md shadow-sm"/></div>
            <div className="sm:col-span-3"><input type="text" name="degree" placeholder="Bằng cấp" value={edu.degree} onChange={(e) => handleEducationChange(index, e)} className="w-full border-gray-300 rounded-md shadow-sm"/></div>
            <div className="sm:col-span-3"><input type="text" name="fieldOfStudy" placeholder="Ngành học" value={edu.fieldOfStudy} onChange={(e) => handleEducationChange(index, e)} className="w-full border-gray-300 rounded-md shadow-sm"/></div>
            <div className="sm:col-span-3"><input type="text" name="graduationYear" placeholder="Năm tốt nghiệp" value={edu.graduationYear} onChange={(e) => handleEducationChange(index, e)} className="w-full border-gray-300 rounded-md shadow-sm"/></div>
          </div>
        ))}
        <button type="button" onClick={addEducation} className="text-sm font-medium text-blue-600 hover:text-blue-800">+ Thêm học vấn</button>
      </section>

      {/* Work Experience Section */}
      <section className="mt-10">
        <h3 className="text-xl font-semibold text-slate-700 mb-4 border-b pb-2">Kinh nghiệm làm việc</h3>
        {workExperience.map((work, index) => (
          <div key={work.id} className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mb-6 p-4 border rounded-md relative bg-slate-50">
             {workExperience.length > 1 && (
                <button type="button" onClick={() => removeWork(work.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                </button>
            )}
            <div className="sm:col-span-3"><input type="text" name="company" placeholder="Công ty" value={work.company} onChange={(e) => handleWorkChange(index, e)} className="w-full border-gray-300 rounded-md shadow-sm"/></div>
            <div className="sm:col-span-3"><input type="text" name="position" placeholder="Chức vụ" value={work.position} onChange={(e) => handleWorkChange(index, e)} className="w-full border-gray-300 rounded-md shadow-sm"/></div>
            <div className="sm:col-span-3"><label className="text-xs text-slate-500 ml-1">Ngày bắt đầu</label><input type="date" name="startDate" value={work.startDate} onChange={(e) => handleWorkChange(index, e)} className="w-full border-gray-300 rounded-md shadow-sm"/></div>
            <div className="sm:col-span-3"><label className="text-xs text-slate-500 ml-1">Ngày kết thúc</label><input type="date" name="endDate" value={work.endDate} onChange={(e) => handleWorkChange(index, e)} className="w-full border-gray-300 rounded-md shadow-sm"/></div>
            <div className="sm:col-span-6"><textarea name="description" rows={3} placeholder="Mô tả công việc" value={work.description} onChange={(e) => handleWorkChange(index, e)} className="w-full border-gray-300 rounded-md shadow-sm"/></div>
          </div>
        ))}
        <button type="button" onClick={addWork} className="text-sm font-medium text-blue-600 hover:text-blue-800">+ Thêm kinh nghiệm làm việc</button>
      </section>

    </div>
  );
};

export default StepExperience;