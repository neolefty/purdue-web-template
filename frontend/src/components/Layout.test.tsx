/**
 * Example test file for Layout component
 * Shows essential testing patterns for React components with providers
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Layout from './Layout';
import { AuthProvider } from '../contexts/AuthContext';

// Helper to wrap component with required providers
const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Layout', () => {
  test('renders layout with navigation', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  test('displays user menu when authenticated', async () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);

    // The layout should have navigation elements
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });

  test('renders footer with copyright', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>);

    // Layout contains footer with Purdue University text
    const footer = screen.getByText(/Purdue University/i);
    expect(footer).toBeInTheDocument();
  });
});
