// types/intake.ts
// types/intake.ts

export interface MedicalHistoryData {
  // Personal Details
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | 'other'
  nationalId: string
  residentialAddress: string

  // Occupation & Employer
  occupation: string
  employer: {
    name: string
    address: string
  }

  // Next of Kin / Emergency Contact
  nextOfKin: {
    name: string
    relationship: string
    phone: string
    address: string
  }

  // Clinical Information
  diagnosis: string
  referringPhysician: string
  admissionDate: string
  mobilityStatus: 'walking' | 'wheelchair' | 'stretcher' | 'assistance_needed'
  currentSymptoms: string

  // Allergy Details
  allergyDetails?: string

  // Additional Notes
  additionalNotes?: string

  // Consent
  consentGiven: boolean
  consentDate: string
}

export interface IntakeFormData {
  // Form fields for submission
  maritalStatus: string
  nationalId: string
  residentialAddress: string
  occupation: string
  employerName: string
  employerAddress: string

  nextOfKinName: string
  nextOfKinRelationship: string
  nextOfKinPhone: string
  nextOfKinAddress: string

  diagnosis: string
  referringPhysician: string
  admissionDate: string
  mobilityStatus: string
  currentSymptoms: string

  allergyDetails?: string

  additionalNotes?: string
  consentGiven: boolean
}