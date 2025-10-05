-- Add membership_fee_paid column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS membership_fee_paid BOOLEAN NOT NULL DEFAULT FALSE;

-- Update existing profiles to have membership_fee_paid as false if payment_status is pending
UPDATE public.profiles SET membership_fee_paid = CASE WHEN payment_status = 'completed' THEN TRUE ELSE FALSE END;

-- Add membership_payment_reference column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS membership_payment_reference TEXT;
