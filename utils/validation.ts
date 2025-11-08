export interface PasswordValidationResult {
  valid: boolean;
  criteria: {
    minLength: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    specialChar: boolean;
  };
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const result: PasswordValidationResult = {
    valid: true,
    criteria: {
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  };

  // The password is valid if all criteria are met
  result.valid = Object.values(result.criteria).every(Boolean);

  return result;
};

export const formatFullName = (name: string): string => {
  if (!name) return '';
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(' ');
};

export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  // A common regex for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  if (!phone) return false;
  // Validates for exactly 10 digits
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
};