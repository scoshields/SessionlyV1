-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add subscription fields to auth.users
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS subscription_plan text;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS subscription_status text;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS subscription_ends_at timestamptz;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- Drop existing tables
DROP TABLE IF EXISTS therapy_notes;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS clients;

-- Create clients table
CREATE TABLE clients (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    therapist_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text,
    phone text,
    emergency_contact text,
    emergency_phone text,
    date_of_birth date,
    address text,
    insurance text,
    status text DEFAULT 'active',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create sessions table
CREATE TABLE sessions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    therapist_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
    date date NOT NULL,
    time time NOT NULL,
    duration integer NOT NULL,
    status text DEFAULT 'scheduled',
    type text DEFAULT 'individual',
    notes text,
    recurrence jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT sessions_type_check CHECK (type IN ('initial', 'individual', 'family', 'couple', 'followup', 'emergency', 'telehealth'))
);

-- Create therapy_notes table
CREATE TABLE therapy_notes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    therapist_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
    session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapy_notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own clients"
    ON clients FOR SELECT
    TO authenticated
    USING (therapist_id = auth.uid());

CREATE POLICY "Users can insert their own clients"
    ON clients FOR INSERT
    TO authenticated
    WITH CHECK (therapist_id = auth.uid());

CREATE POLICY "Users can update their own clients"
    ON clients FOR UPDATE
    TO authenticated
    USING (therapist_id = auth.uid());

CREATE POLICY "Users can delete their own clients"
    ON clients FOR DELETE
    TO authenticated
    USING (therapist_id = auth.uid());

CREATE POLICY "Users can view their own sessions"
    ON sessions FOR SELECT
    TO authenticated
    USING (therapist_id = auth.uid());

CREATE POLICY "Users can insert their own sessions"
    ON sessions FOR INSERT
    TO authenticated
    WITH CHECK (therapist_id = auth.uid());

CREATE POLICY "Users can update their own sessions"
    ON sessions FOR UPDATE
    TO authenticated
    USING (therapist_id = auth.uid());

CREATE POLICY "Users can delete their own sessions"
    ON sessions FOR DELETE
    TO authenticated
    USING (therapist_id = auth.uid());

CREATE POLICY "Users can view their own notes"
    ON therapy_notes FOR SELECT
    TO authenticated
    USING (therapist_id = auth.uid());

CREATE POLICY "Users can insert their own notes"
    ON therapy_notes FOR INSERT
    TO authenticated
    WITH CHECK (therapist_id = auth.uid());

CREATE POLICY "Users can update their own notes"
    ON therapy_notes FOR UPDATE
    TO authenticated
    USING (therapist_id = auth.uid());

CREATE POLICY "Users can delete their own notes"
    ON therapy_notes FOR DELETE
    TO authenticated
    USING (therapist_id = auth.uid());

-- Grant necessary permissions
GRANT ALL ON clients TO authenticated;
GRANT ALL ON sessions TO authenticated;
GRANT ALL ON therapy_notes TO authenticated;