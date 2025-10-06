-- Simple migration to add layout_config field to templates table
-- Only adds the field if it doesn't exist

-- Add layout_config column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'templates' 
        AND column_name = 'layout_config'
    ) THEN
        ALTER TABLE templates ADD COLUMN layout_config jsonb DEFAULT '{}';
    END IF;
END $$;

-- Update existing templates with their layout configurations
-- Template1: Keep current centered layout
UPDATE templates 
SET layout_config = '{
  "headerLayout": {
    "type": "centered",
    "avatarPosition": "center",
    "avatarSize": "medium",
    "officerInfoPosition": "center",
    "companyInfoPosition": "center",
    "buttonsPosition": "center",
    "spacing": {
      "avatarToOfficer": 16,
      "officerToCompany": 16,
      "companyToButtons": 16
    }
  },
  "mainContentLayout": {
    "type": "grid",
    "sidebarPosition": "right",
    "sidebarWidth": "narrow",
    "contentAreaWidth": "full"
  }
}'::jsonb
WHERE slug = 'template1' AND layout_config = '{}';

-- Template2: Use new horizontal layout
UPDATE templates 
SET layout_config = '{
  "headerLayout": {
    "type": "horizontal",
    "avatarPosition": "left",
    "avatarSize": "large",
    "officerInfoPosition": "left",
    "companyInfoPosition": "center",
    "buttonsPosition": "right",
    "spacing": {
      "avatarToOfficer": 24,
      "officerToCompany": 32,
      "companyToButtons": 48
    }
  },
  "mainContentLayout": {
    "type": "sidebar",
    "sidebarPosition": "left",
    "sidebarWidth": "wide",
    "contentAreaWidth": "reduced"
  }
}'::jsonb
WHERE slug = 'template2' AND layout_config = '{}';

-- Add index for layout_config queries if it doesn't exist
CREATE INDEX IF NOT EXISTS template_layout_config_idx ON templates USING GIN (layout_config);
