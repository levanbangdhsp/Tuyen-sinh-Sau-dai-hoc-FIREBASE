
import React, { useState, useEffect } from 'react';
import type { Applicant } from '../types';
import { ApplicationStatus } from '../types';

interface DashboardProps {
  applicantData: Applicant;
}

const statusProgression = [
  ApplicationStatus.Submitted,
  ApplicationStatus.UnderReview,
  ApplicationStatus.Interview,
  ApplicationStatus.Accepted,
];

const StatusPill: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
    const baseClasses = "px-3 py-1 text-sm font-semibold rounded-full inline-block";
    let colorClasses = "";

    switch(status) {
        case ApplicationStatus.Submitted:
            colorClasses = "bg-blue-100 text-blue-800";
            break;
        case ApplicationStatus.UnderReview:
            colorClasses = "bg-yellow-100 text-yellow-800";
            break;
        case ApplicationStatus.Interview:
            colorClasses = "bg-purple-100 text-purple-800";
            break;
        case ApplicationStatus.Accepted:
            colorClasses = "bg-green-100 text-green-800";
            break;
        case ApplicationStatus.Rejected:
            colorClasses = "bg-red-100 text-red-800";
            break;
    }

    return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
}

const Dashboard: React.FC<DashboardProps> = ({ applicantData }) => {
  const [status, setStatus] = useState<ApplicationStatus>(ApplicationStatus.Submitted);
  
  useEffect(() => {
    if (status !== ApplicationStatus.Accepted) {
        const timeoutId = setTimeout(() => {
            const currentIndex = statusProgression.indexOf(status);
            if(currentIndex < statusProgression.length - 1) {
                setStatus(statusProgression[currentIndex + 1]);
            }
        }, 5000); // Update status every 5 seconds for demo
        return () => clearTimeout(timeoutId);
    }
  }, [status]);

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 lg:p-10 animate-fade-in">
        <div className="text-center border-b pb-6 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h2 className="text-3xl font-bold text-slate-800">Cảm ơn bạn, {applicantData.personalInfo.fullName}!</h2>
            <p className="text-slate-600 mt-2">Hồ sơ của bạn cho chương trình <strong>{applicantData.program?.name}</strong> đã được nộp thành công.</p>
            <p className="text-sm text-slate-500 mt-1">Chúng tôi đã gửi một email xác nhận đến {applicantData.personalInfo.email}.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-slate-700 mb-4">Tình trạng hồ sơ</h3>
                <div className="flex items-center space-x-4">
                    <div className="text-lg font-bold">Hiện tại:</div>
                    <StatusPill status={status} />
                </div>
                <p className="text-sm text-slate-500 mt-3">Tình trạng hồ sơ của bạn sẽ được cập nhật tại đây. Vui lòng kiểm tra thường xuyên.</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-slate-700 mb-4">Thông tin của bạn</h3>
                <dl className="space-y-2">
                    <div className="flex justify-between">
                        <dt className="font-medium text-slate-600">Email:</dt>
                        <dd className="text-slate-800">{applicantData.personalInfo.email}</dd>
                    </div>
                     <div className="flex justify-between">
                        <dt className="font-medium text-slate-600">Điện thoại:</dt>
                        <dd className="text-slate-800">{applicantData.personalInfo.phone}</dd>
                    </div>
                     <div className="flex justify-between">
                        <dt className="font-medium text-slate-600">Chương trình:</dt>
                        <dd className="text-slate-800 font-semibold">{applicantData.program?.name}</dd>
                    </div>
                </dl>
            </div>
        </div>
        
        <div className="mt-8 text-center">
            <a href="#" onClick={(e) => { e.preventDefault(); window.location.reload(); }} className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                Nộp hồ sơ mới
            </a>
        </div>
    </div>
  );
};

export default Dashboard;