
import React, { useState } from 'react';
import type { Applicant, Program } from '../types';
import { FORM_STEPS } from '../constants';
import Stepper from './Stepper';
import StepProgram from './steps/StepProgram';
import StepPersonalInfo from './steps/StepPersonalInfo';
import StepExperience from './steps/StepExperience';
import StepDocuments from './steps/StepDocuments';
import StepReview from './steps/StepReview';

interface ApplicationFormProps {
  onSubmit: (data: Applicant) => void;
}

const initialApplicantState: Applicant = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
  },
  program: null,
  education: [{ id: Date.now(), institution: '', degree: '', fieldOfStudy: '', graduationYear: '' }],
  workExperience: [{ id: Date.now(), company: '', position: '', startDate: '', endDate: '', description: '' }],
  documents: {
    statementOfPurpose: '',
    resume: { file: null, name: '' },
    transcripts: { file: null, name: '' },
    recommendationLetter1: { file: null, name: '' },
  },
};

const ApplicationForm: React.FC<ApplicationFormProps> = ({ onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [applicantData, setApplicantData] = useState<Applicant>(initialApplicantState);

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, FORM_STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const updateData = (data: Partial<Applicant>) => {
    setApplicantData((prev) => ({ ...prev, ...data }));
  };
  
  const handleProgramSelect = (program: Program) => {
    updateData({ program });
    // Automatically move to the next step after selection
    setTimeout(() => handleNext(), 200);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepProgram 
                  selectedProgram={applicantData.program} 
                  onProgramSelect={handleProgramSelect}
                />;
      case 1:
        return <StepPersonalInfo 
                  personalInfo={applicantData.personalInfo}
                  onUpdate={(info) => updateData({ personalInfo: info })}
                />;
      case 2:
        return <StepExperience 
                  education={applicantData.education}
                  workExperience={applicantData.workExperience}
                  onUpdate={(edu, work) => updateData({ education: edu, workExperience: work })}
                />;
      case 3:
        return <StepDocuments 
                  documents={applicantData.documents}
                  onUpdate={(docs) => updateData({ documents: docs })}
                />;
      case 4:
        return <StepReview applicantData={applicantData} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 lg:p-10">
      <Stepper steps={FORM_STEPS} currentStep={currentStep} />
      <div className="mt-8 min-h-[400px]">
        {renderStep()}
      </div>
      <div className="mt-10 flex justify-between border-t pt-6">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="px-6 py-2 bg-slate-200 text-slate-700 font-medium rounded-md hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Quay lại
        </button>
        {currentStep < FORM_STEPS.length - 1 ? (
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={currentStep === 0 && !applicantData.program}
          >
            Tiếp theo
          </button>
        ) : (
          <button
            onClick={() => onSubmit(applicantData)}
            className="px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
          >
            Nộp Hồ Sơ
          </button>
        )}
      </div>
    </div>
  );
};

export default ApplicationForm;