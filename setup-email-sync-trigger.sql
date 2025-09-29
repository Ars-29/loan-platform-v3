-- Create function to sync email changes from auth.users to public.users
CREATE OR REPLACE FUNCTION sync_user_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the email in the public.users table when auth.users email changes
  UPDATE public.users 
  SET 
    email = NEW.email,
    updated_at = NOW()
  WHERE id = NEW.id;
  
  -- Return the new record
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS sync_user_email_trigger ON auth.users;

-- Create the trigger
CREATE TRIGGER sync_user_email_trigger
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_email();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres;
GRANT UPDATE ON public.users TO postgres;
