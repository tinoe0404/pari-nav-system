-- Migration to add missing columns to treatment_plans table
ALTER TABLE treatment_plans 
-- Nutritional Interventions
ADD COLUMN IF NOT EXISTS nutritional_interventions JSONB,

-- Skin Care Management
ADD COLUMN IF NOT EXISTS skin_care_dos TEXT[],
ADD COLUMN IF NOT EXISTS skin_care_donts TEXT[],

-- Immobilization Device & Setup
ADD COLUMN IF NOT EXISTS immobilization_device TEXT,
ADD COLUMN IF NOT EXISTS setup_considerations TEXT,

-- Essential Prescription Components
ADD COLUMN IF NOT EXISTS patient_demographics TEXT,
ADD COLUMN IF NOT EXISTS primary_diagnosis TEXT,
ADD COLUMN IF NOT EXISTS treatment_intent TEXT,
ADD COLUMN IF NOT EXISTS anatomical_target TEXT,
ADD COLUMN IF NOT EXISTS energy_modality TEXT,
ADD COLUMN IF NOT EXISTS absorbed_dose TEXT,
ADD COLUMN IF NOT EXISTS fractionation_schedule TEXT,
ADD COLUMN IF NOT EXISTS volume_definitions TEXT,
ADD COLUMN IF NOT EXISTS technique TEXT,
ADD COLUMN IF NOT EXISTS image_guidance TEXT;

-- Ensure created_by column exists (referenced in publishTreatmentPlan action)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'treatment_plans' AND column_name = 'created_by') THEN
        ALTER TABLE treatment_plans ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
END $$;
