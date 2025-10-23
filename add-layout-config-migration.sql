-- Migration: Add layout_config field to templates table
-- This allows templates to have different layout configurations
-- Template1: Centered layout (current)
-- Template2: Horizontal layout (new)

-- Add layout_config column to templates table
ALTER TABLE templates ADD COLUMN layout_config jsonb DEFAULT '{}';

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
WHERE slug = 'template1';

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
WHERE slug = 'template2';

-- Add index for layout_config queries
CREATE INDEX IF NOT EXISTS template_layout_config_idx ON templates USING GIN (layout_config);

-- Add comment for documentation
COMMENT ON COLUMN templates.layout_config IS 'Layout configuration for different template layouts - headerLayout and mainContentLayout settings';
