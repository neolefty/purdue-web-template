/**
 * Test file for Button component
 * Example of testing a versatile button that can render as button, Link, or anchor
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, test, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Button from './Button';

describe('Button Component', () => {
  test('renders as a button and handles clicks', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('renders as a Link when "to" prop is provided', () => {
    render(
      <BrowserRouter>
        <Button to="/dashboard" variant="primary">Go to Dashboard</Button>
      </BrowserRouter>
    );

    const link = screen.getByRole('link', { name: /go to dashboard/i });
    expect(link).toHaveAttribute('href', '/dashboard');
    expect(link).toHaveClass('btn-primary');
  });
});
