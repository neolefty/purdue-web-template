/**
 * Test file for Header component
 * Example of testing navigation component with auth context
 */

import { type ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './Header';
import { AuthProvider } from '../contexts/AuthContext';

// Helper to wrap component with required providers
const renderWithProviders = (component: ReactElement) => {
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

describe('Header Component', () => {
  test('renders navigation with logo and links', () => {
    renderWithProviders(<Header />);

    // Check that navigation exists
    expect(screen.getByRole('navigation')).toBeInTheDocument();

    // Check for Purdue logo
    const logo = screen.getByAltText('Purdue University');
    expect(logo).toHaveAttribute('src', '/purdue-logo.svg');

    // Check for navigation links
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
  });

  test('shows login button when not authenticated', () => {
    renderWithProviders(<Header />);

    // Should show login link when not authenticated
    const loginLink = screen.getByRole('link', { name: /login/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});
