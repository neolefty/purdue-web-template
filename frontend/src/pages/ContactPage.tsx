/* global HTMLInputElement, HTMLTextAreaElement */
import React, { useState } from 'react'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageLayout from '@/components/PageLayout'
import PageHeader from '@/components/PageHeader'
import { useContactForm } from '@/api/contact'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const contactMutation = useContactForm()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    contactMutation.mutate(formData)
  }

  if (contactMutation.isSuccess) {
    return (
      <PageLayout width="default">
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-purdue-gray-900 mb-4">
                Message Sent Successfully
              </h2>
              <p className="text-purdue-gray-600 mb-6">
                Thank you for your message. We'll get back to you as soon as possible.
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => {
                    setFormData({ name: '', email: '', subject: '', message: '' })
                    contactMutation.reset()
                  }}
                  variant="primary"
                >
                  Send Another Message
                </Button>
                <Button to="/" variant="outline">
                  Return Home
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout width="default">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="Contact Us"
          subtitle="Have a question or feedback? We'd love to hear from you."
        />

        <Card>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-purdue-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-purdue-gray-300 rounded-md focus:ring-2 focus:ring-purdue-gold focus:border-transparent"
                  required
                  placeholder="Your full name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-purdue-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-purdue-gray-300 rounded-md focus:ring-2 focus:ring-purdue-gold focus:border-transparent"
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Subject Field */}
              <div>
                <label className="block text-sm font-medium text-purdue-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-purdue-gray-300 rounded-md focus:ring-2 focus:ring-purdue-gold focus:border-transparent"
                  required
                  placeholder="Brief subject line"
                />
              </div>

              {/* Message Field */}
              <div>
                <label className="block text-sm font-medium text-purdue-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleTextareaChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-purdue-gray-300 rounded-md focus:ring-2 focus:ring-purdue-gold focus:border-transparent resize-none"
                  required
                  placeholder="Your message (at least 10 characters)"
                  minLength={10}
                />
              </div>

              {/* Error Message */}
              {contactMutation.isError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">
                    {(contactMutation.error as { response?: { data?: { message?: string } } })?.response
                      ?.data?.message || 'Failed to send message. Please try again or contact us directly.'}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={contactMutation.isPending}
              >
                {contactMutation.isPending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-purdue-gray-200 text-center text-sm text-purdue-gray-500">
            <p>
              By submitting this form, you agree that we may use your information to respond to your
              inquiry.
            </p>
          </div>
        </Card>
      </div>
    </PageLayout>
  )
}
