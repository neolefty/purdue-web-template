/**
 * API functions for contact form
 */

import { useMutation } from '@tanstack/react-query'
import apiClient from './client'

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
  submitted_url?: string
}

export interface ContactResponse {
  message: string
}

/**
 * Submit contact form
 */
async function submitContactForm(data: ContactFormData): Promise<ContactResponse> {
  return apiClient.post<ContactResponse>('/contact/', data)
}

/**
 * Hook for submitting contact form
 */
export function useContactForm() {
  return useMutation({
    mutationFn: submitContactForm,
  })
}
