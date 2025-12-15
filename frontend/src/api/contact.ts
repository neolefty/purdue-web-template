/**
 * API functions for contact form
 */

import { useMutation } from '@tanstack/react-query'
import apiClient from './client'
import { API_ENDPOINTS } from './endpoints'

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
  submitted_url?: string
  // Spam protection fields
  website?: string // Honeypot field - should always be empty
  form_loaded_at?: number // Timestamp when form was loaded
}

export interface ContactResponse {
  message: string
}

/**
 * Submit contact form
 */
async function submitContactForm(data: ContactFormData): Promise<ContactResponse> {
  return apiClient.post<ContactResponse>(API_ENDPOINTS.CONTACT, data)
}

/**
 * Hook for submitting contact form
 */
export function useContactForm() {
  return useMutation({
    mutationFn: submitContactForm,
  })
}
