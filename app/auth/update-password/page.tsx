'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Password strength checker
function checkPasswordStrength(password: string) {
  let strength = 0
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  if (checks.length) strength++
  if (checks.uppercase) strength++
  if (checks.lowercase) strength++
  if (checks.number) strength++
  if (checks.special) strength++

  return { strength, checks }
}

function getStrengthLabel(strength: number) {
  if (strength === 0) return { label: '', color: '' }
  if (strength <= 2) return { label: 'Weak', color: 'text-red-600 bg-red-100' }
  if (strength <= 3) return { label: 'Fair', color: 'text-yellow-600 bg-yellow-100' }
  if (strength <= 4) return { label: 'Good', color: 'text-blue-600 bg-blue-100' }
  return { label: 'Strong', color: 'text-green-600 bg-green-100' }
}

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ 
    strength: 0, 
    checks: { length: false, uppercase: false, lowercase: false, number: false, special: false } 
  })

  const supabase = createClient()

  // Check if user has valid recovery session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsValidSession(true)
      } else {
        setError('Invalid or expired reset link. Please request a new password reset.')
      }
    }
    checkSession()
  }, [supabase])

  // Check password strength on change
  useEffect(() => {
    if (password) {
      setPasswordStrength(checkPasswordStrength(password))
    } else {
      setPasswordStrength({ 
        strength: 0, 
        checks: { length: false, uppercase: false, lowercase: false, number: false, special: false } 
      })
    }
  }, [password])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (passwordStrength.strength < 3) {
      setError('Please choose a stronger password. Use at least 8 characters with uppercase, lowercase, and numbers.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Password Reset Successful</CardTitle>
            <CardDescription>
              Your password has been updated. Redirecting to sign in...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!isValidSession && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Invalid Reset Link</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/auth/forgot-password">
              <Button className="w-full">Request New Reset Link</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Reset Your Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            {error && !success && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                New Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={8}
              />
              
              {password && (
                <>
                  <div className="mt-2">
                    <div className={`text-xs font-medium px-2 py-1 rounded inline-block ${getStrengthLabel(passwordStrength.strength).color}`}>
                      {getStrengthLabel(passwordStrength.strength).label}
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-xs">
                      <span className={passwordStrength.checks.length ? 'text-green-600' : 'text-gray-400'}>
                        {passwordStrength.checks.length ? '✓' : '○'} At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className={passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-400'}>
                        {passwordStrength.checks.uppercase ? '✓' : '○'} One uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className={passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-400'}>
                        {passwordStrength.checks.lowercase ? '✓' : '○'} One lowercase letter
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className={passwordStrength.checks.number ? 'text-green-600' : 'text-gray-400'}>
                        {passwordStrength.checks.number ? '✓' : '○'} One number
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className={passwordStrength.checks.special ? 'text-green-600' : 'text-gray-400'}>
                        {passwordStrength.checks.special ? '✓' : '○'} One special character
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={8}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ Passwords do not match
                </p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Passwords match
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !isValidSession || passwordStrength.strength < 3 || password !== confirmPassword}
            >
              {loading ? 'Resetting password...' : 'Reset Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
