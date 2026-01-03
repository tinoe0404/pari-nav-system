// types/intake.ts
export interface MedicalHistoryData {
    // Medical Conditions (Checkboxes)
    conditions: {
      pacemaker: boolean
      previousRadiation: boolean
      claustrophobia: boolean
      metalImplants: boolean
      diabetes: boolean
      heartDisease: boolean
      kidneyDisease: boolean
      pregnant: boolean
      allergies: boolean
    }
    
    // Allergy Details (if checked)
    allergyDetails?: string
    
    // Current Symptoms
    currentSymptoms: string
    
    // Mobility Status
    mobilityStatus: 'walking' | 'wheelchair' | 'stretcher' | 'assistance_needed'
    
    // Next of Kin
    nextOfKin: {
      name: string
      relationship: string
      phone: string
    }
    
    // Additional Notes
    additionalNotes?: string
    
    // Consent
    consentGiven: boolean
    consentDate: string
  }
  
  export interface IntakeFormData {
    // Form fields for submission
    conditions: string[] // Array of selected condition keys
    allergyDetails?: string
    currentSymptoms: string
    mobilityStatus: string
    nextOfKinName: string
    nextOfKinRelationship: string
    nextOfKinPhone: string
    additionalNotes?: string
    consentGiven: boolean
  }