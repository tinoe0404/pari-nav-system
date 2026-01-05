// test-supabase.ts
import { createClient } from '@/utils/supabase/server'

async function testConnection() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('patients').select('count')
  
  if (error) {
    console.error('Supabase connection failed:', error)
  } else {
    console.log('Supabase connection successful!')
  }
}

testConnection()