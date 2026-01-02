// utils/form-validation.ts
export function validatePasswordMatch(password: string, confirmPassword: string): boolean {
    return password === confirmPassword
  }
  
  export function validatePasswordStrength(password: string): {
    isValid: boolean
    message?: string
  } {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters' }
    }
    
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' }
    }
    
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' }
    }
    
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' }
    }
    
    return { isValid: true }
  }