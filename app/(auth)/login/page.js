'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { sendOTP, verifyOTP } from '@/lib/authUtils'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState('email') // 'email' or 'otp'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    // Basic email validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    const result = await sendOTP(email)

    if (result.success) {
      setMessage('Check your email for the verification code')
      setStep('otp')
    } else {
      setError(result.error || 'Failed to send verification code')
    }

    setLoading(false)
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Basic OTP validation - accept 6-8 digits
    if (!otp || otp.length < 6) {
      setError('Please enter the complete verification code')
      setLoading(false)
      return
    }

    const result = await verifyOTP(email, otp)

    if (result.success) {
      // Success! Redirect to home
      router.push('/')
    } else {
      setError(result.error || 'Invalid verification code')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="mb-2">Welcome to <br/>Heresy Forge</h1>
          <p className="text-secondary">
            {step === 'email' 
              ? 'Sign in or create an account' 
              : 'Enter the code sent to your email'}
          </p>
        </div>

        <div className="card p-6">
          {/* Email Step */}
          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label htmlFor="email" className="block mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-surface border border-accent rounded-lg focus:outline-none focus:border-accent"
                  disabled={loading}
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-danger/10 border border-danger rounded-lg text-danger text-sm">
                  {error}
                </div>
              )}

              {message && (
                <div className="p-3 bg-accent/10 border border-accent rounded-lg text-accent text-sm">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg w-full"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block uppercase mb-2">
                  Verification Code
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="00000000"
                  className="w-full px-4 py-3 bg-surface border border-accent rounded-lg focus:outline-none focus:border-accent text-center text-2xl tracking-widest"
                  disabled={loading}
                  maxLength={8}
                  required
                />
                <p className="text-sm text-secondary mt-2 text-center">
                  Code sent to {email}
                </p>
              </div>

              {error && (
                <div className="p-3 bg-danger/10 border border-danger rounded-lg text-danger text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="btn btn-primary btn-lg w-full"
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setOtp('')
                  setError('')
                }}
                className="btn btn-secondary btn-lg w-full"
                disabled={loading}
              >
                Use Different Email
              </button>
            </form>
          )}

          {/* Continue as Guest */}
          <div className="mt-6 pt-6 border-t border-accent/20">
            <button
              onClick={() => router.push('/')}
              className="btn btn-teritary hover:text-accent transition-colors w-full"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}