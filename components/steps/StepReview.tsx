
import React from 'react';
import type { Applicant, Education, WorkExperience } from '../../types';

interface StepReviewProps {
  applicantData: Applicant;
}

const ReviewSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-slate-50 p-4 sm:p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);

const ReviewItem: React.FC<{ label: string; value: string | undefined | null }> = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between">
        <dt className="text-sm font-medium text-slate-600">{label}:</dt>
        <dd className="text-sm text-slate-800 sm:text-right font-semibold">{value || 'N/A'}</dd>
    </div>
);

const StepReview: React.FC<StepReviewProps> = ({ applicantData }) => {
  const { personalInfo, program, education, workExperience, documents } = applicantData;

  const hasWorkExperience = workExperience.some(w => w.company && w.position);

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Xem lại và Gửi</h2>
      <p className="text-slate-600 mb-6">Vui lòng xem lại cẩn thận tất cả thông tin trước khi nộp hồ sơ.</p>

      <div className="space-y-8">
        <ReviewSection title="Chương trình đã chọn">
            <ReviewItem label="Tên chương trình" value={program?.name} />
            <ReviewItem label="Khoa" value={program?.faculty} />
        </ReviewSection>

        <ReviewSection title="Thông tin cá nhân">
            <ReviewItem label="Họ và tên" value={personalInfo.fullName} />
            <ReviewItem label="Email" value={personalInfo.email} />
            <ReviewItem label="Điện thoại" value={personalInfo.phone} />
            <ReviewItem label="Ngày sinh" value={personalInfo.dob} />
            <ReviewItem label="Địa chỉ" value={personalInfo.address} />
        </ReviewSection>

        <ReviewSection title="Học vấn">
            {education.map((edu) => (
                <div key={edu.id} className="p-3 border rounded-md bg-white">
                    <p className="font-bold">{edu.institution || 'Chưa cung cấp'}</p>
                    <p className="text-sm text-slate-600">{edu.degree || 'N/A'} trong {edu.fieldOfStudy || 'N/A'} - {edu.graduationYear || 'N/A'}</p>
                </div>
            ))}
        </ReviewSection>

        {hasWorkExperience && (
            <ReviewSection title="Kinh nghiệm làm việc">
                {workExperience.map((work) => (
                    work.company && <div key={work.id} className="p-3 border rounded-md bg-white">
                        <p className="font-bold">{work.position} tại {work.company}</p>
                        <p className="text-sm text-slate-600">{work.startDate} đến {work.endDate || 'Hiện tại'}</p>
                    </div>
                ))}
            </ReviewSection>
        )}

        <ReviewSection title="Tài liệu đã tải lên">
            <ReviewItem label="Tuyên bố Mục đích" value={documents.statementOfPurpose ? `${documents.statementOfPurpose.substring(0, 50)}...` : 'Chưa cung cấp'} />
            <ReviewItem label="Sơ yếu lý lịch / CV" value={documents.resume.name} />
            <ReviewItem label="Bảng điểm" value={documents.transcripts.name} />
            <ReviewItem label="Thư giới thiệu" value={documents.recommendationLetter1.name} />
        </ReviewSection>
      </div>
    </div>
  );
};

export default StepReview;