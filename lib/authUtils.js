import { supabase } from './supabase'

/**
 * Send OTP code to email
 * @param {string} email - User's email address
 * @returns {Promise<Object>} - { success, error }
 */
export async function sendOTP(email) {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: undefined, // Prevent magic link, force OTP
      }
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Verify OTP code
 * @param {string} email - User's email address
 * @param {string} token - 6-digit OTP code
 * @returns {Promise<Object>} - { success, error, session }
 */
export async function verifyOTP(email, token) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: token,
      type: 'email'
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, session: data.session, user: data.user }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Sign out current user
 * @returns {Promise<Object>} - { success, error }
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Get current user session
 * @returns {Promise<Object>} - { user, session }
 */
export async function getCurrentUser() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      return { user: null, session: null }
    }

    return { user: session?.user || null, session }
  } catch (err) {
    return { user: null, session: null }
  }
}

/**
 * Listen to auth state changes
 * @param {Function} callback - Called when auth state changes
 * @returns {Object} - Subscription object with unsubscribe method
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}