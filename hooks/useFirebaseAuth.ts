import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { User } from '../types';

export const useFirebaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true); // Bắt đầu tải mỗi khi trạng thái auth thay đổi
      if (firebaseUser) {
        // Khi người dùng đăng nhập, lấy thông tin hồ sơ từ Firestore để có dữ liệu mới nhất
        try {
          const docRef = doc(db, 'applications', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          const firestoreData = docSnap.exists() ? docSnap.data() : null;
          
          // Ưu tiên lấy họ tên và SĐT từ Firestore, nếu không có thì mới dùng dữ liệu từ Auth
          const fullName = firestoreData?.fullName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
          const phone = firestoreData?.phone || firebaseUser.phoneNumber || '';

          const appUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            fullName,
            phone,
            emailVerified: firebaseUser.emailVerified,
          };
          setUser(appUser);
        } catch (error) {
          console.error("Lỗi khi lấy hồ sơ người dùng từ Firestore:", error);
          // Dự phòng: dùng dữ liệu từ Auth nếu Firestore lỗi để không ảnh hưởng đăng nhập
          const appUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            phone: firebaseUser.phoneNumber || '',
            emailVerified: firebaseUser.emailVerified,
          };
          setUser(appUser);
        }
      } else {
        // Người dùng đã đăng xuất
        setUser(null);
      }
      setLoading(false);
    });

    // Dọn dẹp listener khi component bị unmount
    return () => unsubscribe();
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      // Listener onAuthStateChanged sẽ tự động cập nhật trạng thái người dùng về null
    } catch (error) {
      console.error("Lỗi khi đăng xuất: ", error);
    }
  }, []);

  return { user, loading, logout };
};