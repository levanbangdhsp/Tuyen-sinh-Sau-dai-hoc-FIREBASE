
import React from 'react';

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
}

interface StepPersonalInfoProps {
  personalInfo: PersonalInfo;
  onUpdate: (info: PersonalInfo) => void;
}

const InputField: React.FC<{label: string, id: string, type: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void, required?: boolean, placeholder?: string}> = 
({ label, id, type, value, onChange, required=true, placeholder='' }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
            {label}
        </label>
        <div className="mt-1">
            <input
                type={type}
                name={id}
                id={id}
                value={value}
                onChange={onChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                required={required}
                placeholder={placeholder}
            />
        </div>
    </div>
);


const StepPersonalInfo: React.FC<StepPersonalInfoProps> = ({ personalInfo, onUpdate }) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onUpdate({ ...personalInfo, [name]: value });
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Thông tin cá nhân</h2>
      <p className="text-slate-600 mb-6">Vui lòng cung cấp thông tin liên lạc chính xác của bạn.</p>
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-6">
          <InputField label="Họ và tên" id="fullName" type="text" value={personalInfo.fullName} onChange={handleChange} placeholder="Nguyễn Văn A" />
        </div>
        <div className="sm:col-span-3">
          <InputField label="Địa chỉ Email" id="email" type="email" value={personalInfo.email} onChange={handleChange} placeholder="email@example.com" />
        </div>
        <div className="sm:col-span-3">
          <InputField label="Số điện thoại" id="phone" type="tel" value={personalInfo.phone} onChange={handleChange} placeholder="0901234567" />
        </div>
        <div className="sm:col-span-3">
          <InputField label="Ngày sinh" id="dob" type="date" value={personalInfo.dob} onChange={handleChange} />
        </div>
        <div className="sm:col-span-6">
          <label htmlFor="address" className="block text-sm font-medium text-slate-700">
            Địa chỉ
          </label>
          <div className="mt-1">
            <textarea
                id="address"
                name="address"
                rows={3}
                value={personalInfo.address}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                placeholder="123 Đường ABC, Quận 1, TP. HCM"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepPersonalInfo;