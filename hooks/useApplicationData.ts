import { useState, useEffect, useCallback } from 'react';
import { User, ApplicationStatusData, ApplicationStatusEnum, ApplicationFormData } from '../types';
import { db } from '../firebaseConfig';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { MAJORS_DATA } from '../constants';


const formatDate = (dateValue: any): string | null => {
    if (!dateValue) return null;
    if (dateValue instanceof Timestamp) {
        const date = dateValue.toDate();
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    // Fallback for string dates if any
    if (typeof dateValue === 'string') {
       try {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return dateValue;
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return dateValue;
        }
    }
    return null;
};


export const useApplicationData = (user: User | null) => {
  const [statusData, setStatusData] = useState<ApplicationStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!user) {
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, 'applications', user.id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setStatusData({
            status: ApplicationStatusEnum.NOT_SUBMITTED,
            details: 'Bạn chưa nộp hồ sơ. Vui lòng hoàn thành và lưu thông tin tại trang hồ sơ.',
            timeline: [
                { stage: 'Nộp hồ sơ', date: null, completed: false, current: true },
                { stage: 'Phòng Sau đại học xử lý', date: null, completed: false, current: false },
                { stage: 'Hoàn tất xét duyệt', date: null, completed: false, current: false },
            ],
            admissionResult: 'Chưa có',
        });
        setLoading(false);
        return;
      }
      
      const data = docSnap.data() as ApplicationFormData & { 
          lastUpdatedAt?: Timestamp;
          submittedAt?: Timestamp;
          processingDate?: Timestamp;
          statusUpdateDate?: Timestamp;
          reviewNotes?: string;
          profileStatus?: string; // e.g., 'Đủ điều kiện', 'Bổ sung', 'Không đủ điều kiện'
          admissionResultStatus?: string; // e.g., 'Trúng tuyển NV1', 'Không trúng tuyển'
          admittedMajor?: string;
          admittedOrientation?: string;
      };
      
      let finalStatusData: ApplicationStatusData;

      // ===================================================================
      // NEW LOGIC IMPLEMENTATION FOR FIRESTORE STARTS HERE
      // ===================================================================

      // STEP 1: MANDATORY FILE CHECK (HIGHEST PRIORITY)
      const allDocuments = [
          { key: 'linkAnhThe', name: '1. Ảnh thẻ 4x6', isRequired: () => true },
          { key: 'linkBangTotNghiep', name: '2. Bản scan Bằng tốt nghiệp đại học', isRequired: () => true },
          { key: 'linkBangDiem', name: '3. Bản scan Bảng điểm đại học', isRequired: () => true },
          { key: 'linkChungChiNN', name: '4. Bản scan Chứng chỉ ngoại ngữ', isRequired: () => true },
          { key: 'linkUuTien', name: '5. Minh chứng đối tượng ưu tiên', isRequired: () => data.priorityCategory !== '0' },
          { key: 'linkNCKH', name: '6. Minh chứng NCKH & thành tích khác', isRequired: () => data.researchAchievements !== 'NCKH0' || data.otherAchievements !== 'KHAC0' },
      ];

      const requiredDocuments = allDocuments.filter(doc => doc.isRequired());
      const missingDocs = requiredDocuments
          .filter(doc => !data[doc.key as keyof ApplicationFormData])
          .map(doc => doc.name);

      const submissionDate = formatDate(data.submittedAt || data.lastUpdatedAt);
      const processingDate = formatDate(data.processingDate);
      const statusUpdateDate = formatDate(data.statusUpdateDate);
      const detailsMessage = data.reviewNotes || '';
      const profileStatusRaw = data.profileStatus || '';

      if (missingDocs.length > 0) {
          finalStatusData = {
              status: ApplicationStatusEnum.NEEDS_UPDATE,
              details: 'Hồ sơ của bạn cần bổ sung các mục sau để được xét duyệt. Vui lòng quay lại trang "Hồ sơ dự tuyển" để tải lên các tệp còn thiếu:',
              missingDocuments: missingDocs,
              timeline: [
                  { stage: 'Nộp hồ sơ', date: submissionDate, completed: true, current: false },
                  { stage: 'Yêu cầu bổ sung (tự động)', date: new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }), completed: false, current: true },
                  { stage: 'Phòng Sau đại học xử lý', date: null, completed: false, current: false },
                  { stage: 'Hoàn tất xét duyệt', date: null, completed: false, current: false },
              ],
              admissionResult: 'Chưa có',
          };
      } else {
          // STEP 2: IF ALL FILES ARE PRESENT, READ ADMIN'S DECISION from profileStatus field
          if (profileStatusRaw.toLowerCase().includes('bổ sung')) {
              finalStatusData = {
                status: ApplicationStatusEnum.NEEDS_UPDATE,
                details: detailsMessage || profileStatusRaw,
                timeline: [
                    { stage: 'Nộp hồ sơ', date: submissionDate, completed: true, current: false },
                    { stage: 'Phòng Sau đại học xử lý', date: processingDate, completed: true, current: false },
                    { stage: 'Yêu cầu bổ sung', date: statusUpdateDate, completed: false, current: true },
                    { stage: 'Hoàn tất xét duyệt', date: null, completed: false, current: false },
                ],
                admissionResult: 'Chưa có',
              };
          } else if (profileStatusRaw.toLowerCase().includes('đủ điều kiện')) {
              finalStatusData = {
                status: ApplicationStatusEnum.VALID,
                details: detailsMessage || 'Chúc mừng! Hồ sơ của bạn đã đáp ứng đủ các tiêu chí và được đánh giá là hợp lệ. Vui lòng đợi thông báo tiếp theo về kết quả trúng tuyển.',
                timeline: [
                    { stage: 'Nộp hồ sơ', date: submissionDate, completed: true, current: false },
                    { stage: 'Phòng Sau đại học xử lý', date: processingDate || statusUpdateDate, completed: true, current: false },
                    { stage: 'Hoàn tất xét duyệt', date: statusUpdateDate, completed: true, current: true }
                ],
                admissionResult: 'Chưa có',
              };
          } else if (profileStatusRaw.trim() !== '') {
              finalStatusData = {
                status: ApplicationStatusEnum.INVALID,
                details: detailsMessage || profileStatusRaw,
                timeline: [
                    { stage: 'Nộp hồ sơ', date: submissionDate, completed: true, current: false },
                    { stage: 'Phòng Sau đại học xử lý', date: processingDate || statusUpdateDate, completed: true, current: false },
                    { stage: 'Hoàn tất xét duyệt', date: statusUpdateDate, completed: true, current: true }
                ],
                admissionResult: 'Không trúng tuyển',
              };
          } else {
              finalStatusData = {
                status: ApplicationStatusEnum.PROCESSING,
                details: detailsMessage || 'Hồ sơ của bạn đã đủ các giấy tờ bắt buộc. Phòng Sau đại học sẽ sớm tiến hành xét duyệt. Vui lòng quay lại sau để xem kết quả cuối cùng.',
                timeline: [
                    { stage: 'Nộp hồ sơ', date: submissionDate, completed: true, current: false },
                    { stage: 'Phòng Sau đại học xử lý', date: processingDate, completed: false, current: true },
                    { stage: 'Hoàn tất xét duyệt', date: null, completed: false, current: false },
                ],
                admissionResult: 'Chưa có',
              };
          }
      }
      
      // ===================================================================
      // REMAINDER OF THE LOGIC (Review Details & Admission Status)
      // ===================================================================

      if (finalStatusData.status === ApplicationStatusEnum.VALID || finalStatusData.status === ApplicationStatusEnum.INVALID || finalStatusData.status === ApplicationStatusEnum.PROCESSING) {
        const graduationScore = parseFloat(String(data.gpa10 || '0').replace(',', '.')) || 0;
        const hasResearchBonus = data.researchAchievements !== 'NCKH0';
        const hasOtherAchievementsBonus = data.otherAchievements !== 'KHAC0';
        const priorityScore = (data.priorityCategory && data.priorityCategory !== '0') ? 0.50 : 0.00;
        const totalScore = Math.min(10.00, graduationScore + priorityScore);
        
        finalStatusData.reviewDetails = {
            graduationScore,
            hasResearchBonus,
            hasOtherAchievementsBonus,
            priorityScore,
            totalScore,
            scholarshipPolicy: data.scholarshipPolicy || 'Không',
        };
      }
      
      let admissionStatus: 'Trúng tuyển' | 'Không trúng tuyển' | 'Chưa có' = 'Chưa có';
      
      if (finalStatusData.status === ApplicationStatusEnum.INVALID) {
          admissionStatus = 'Không trúng tuyển';
      } else if (finalStatusData.status !== ApplicationStatusEnum.VALID) {
          admissionStatus = 'Chưa có';
      } else {
          const admissionResultRaw = data.admissionResultStatus || '';
          if (admissionResultRaw.toLowerCase().includes('không')) {
              admissionStatus = 'Không trúng tuyển';
          } else if (admissionResultRaw.toLowerCase().includes('trúng tuyển')) {
              admissionStatus = 'Trúng tuyển';
          } else {
              admissionStatus = 'Chưa có';
          }
      }
      
      if (admissionStatus === 'Trúng tuyển') {
          const admissionResultRaw = data.admissionResultStatus?.toUpperCase() || '';
          
          const getMajorNameByCode = (code: string) => MAJORS_DATA.find(m => m.code === code)?.name || code || 'Không xác định';

          let admittedMajor = data.admittedMajor || 'Đang cập nhật';
          let admittedOrientation = data.admittedOrientation || 'Đang cập nhật';

          // For backward compatibility with old sheet logic if needed, but primarily uses new fields
          if (admissionResultRaw.includes('NV1')) {
              admittedMajor = getMajorNameByCode(data.firstChoiceMajor);
              admittedOrientation = data.firstChoiceOrientation === 'research' ? 'Nghiên cứu' : 'Ứng dụng';
          } else if (admissionResultRaw.includes('NV2')) {
              admittedMajor = getMajorNameByCode(data.secondChoiceMajor);
              admittedOrientation = data.secondChoiceOrientation === 'research' ? 'Nghiên cứu' : 'Ứng dụng';
          } else if (admissionResultRaw.includes('NV3')) {
              admittedMajor = getMajorNameByCode(data.thirdChoiceMajor);
              admittedOrientation = data.thirdChoiceOrientation === 'research' ? 'Nghiên cứu' : 'Ứng dụng';
          }

          finalStatusData.admissionDetails = {
              admittedMajor,
              admittedOrientation,
          };
      }

      finalStatusData.admissionResult = admissionStatus;
      setStatusData(finalStatusData);

    } catch (e: any) {
        console.error("Failed to fetch application data from Firestore:", e);
        // Fix: Add specific error handling for permission issues to guide the user.
        if (e.code === 'permission-denied') {
            setError('Lỗi phân quyền: Bạn không có quyền truy cập dữ liệu hồ sơ. Vui lòng đảm bảo bạn đã đăng nhập đúng tài khoản. Nếu sự cố vẫn tiếp diễn, vui lòng liên hệ bộ phận hỗ trợ kỹ thuật của nhà trường.');
        } else {
            setError('Đã xảy ra lỗi khi tải trạng thái hồ sơ của bạn. Vui lòng thử lại.');
        }
    } finally {
        setLoading(false);
    }

  }, [user]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { statusData, loading, error, refetch: fetchStatus };
};