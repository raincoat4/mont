import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

// these can be publicly exposed as row level security is enabled
// but do not expose the service key
const supabaseUrl = "https://uhbshyxtuzsqzqyrobcj.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoYnNoeXh0dXpzcXpxeXJvYmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY5ODA3MzcsImV4cCI6MjA0MjU1NjczN30.siDNMtdMNS4BefxtepxnU3Zy8r5xthjE4GeUZJHWyRI"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false,
  },
})