// One-time script to create an admin user.
// Fill in EMAIL and PASSWORD below, run it, then delete this file.
//
//   node scripts/create-admin.mjs

import { createClient } from '@supabase/supabase-js'

const EMAIL    = 'sustainamericallc@gmail.com'
const PASSWORD = 'password'

const supabase = createClient(
  'https://igxnbkgaehqlowydrene.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneG5ia2dhZWhxbG93eWRyZW5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk1NTM4NCwiZXhwIjoyMDg2NTMxMzg0fQ.v01VfCjV34VZqLGz3fxrtWtFJpf89BdH4Dp90SG_2Ko',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const { data, error } = await supabase.auth.admin.createUser({
  email: EMAIL,
  password: PASSWORD,
  email_confirm: true,   // skip confirmation email
})

if (error) {
  console.error('Failed to create user:', error.message)
  process.exit(1)
}

const { error: profileError } = await supabase
  .from('profiles')
  .update({ is_admin: true })
  .eq('id', data.user.id)

if (profileError) {
  console.error('User created but could not set is_admin:', profileError.message)
  console.log('Run this SQL in Supabase dashboard to fix:')
  console.log(`UPDATE profiles SET is_admin = true WHERE id = '${data.user.id}';`)
} else {
  console.log('Done! Admin user created.')
  console.log('Email:', EMAIL)
  console.log('They can change their password at /auth/forgot-password')
}
