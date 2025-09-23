-- Add public_profile_template column to templates table
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS public_profile_template TEXT DEFAULT 'template1';

-- Update all existing templates to have template1 as default
UPDATE templates 
SET public_profile_template = 'template1' 
WHERE public_profile_template IS NULL;

-- Add a check constraint to ensure only valid values
ALTER TABLE templates 
ADD CONSTRAINT check_public_profile_template 
CHECK (public_profile_template IN ('template1', 'template2'));

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_templates_public_profile_template 
ON templates(public_profile_template);

-- Add comment to the column
COMMENT ON COLUMN templates.public_profile_template IS 'Template slug to use for public profile (template1 or template2)';
