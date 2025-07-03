
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vznjwduvptlmhmzajxjw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bmp3ZHV2cHRsbWhtemFqeGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDg5MTUsImV4cCI6MjA2NTI4NDkxNX0.ZAH_p3rIKYlDx2oYzVoKms1-60h1qWB8CF1R2Y4yv_w'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
