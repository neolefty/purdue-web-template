/**
 * Test file for Card component
 * Example of testing a presentational component with different variants
 */

import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import Card from './Card';

describe('Card Component', () => {
  test('renders basic card with children content', () => {
    render(
      <Card>
        <p>This is card content</p>
      </Card>
    );

    expect(screen.getByText('This is card content')).toBeInTheDocument();
  });

  test('renders card with title and badge', () => {
    render(
      <Card
        title="Feature Title"
        badge="NEW"
        badgeColor="gold"
      >
        <p>Feature description</p>
      </Card>
    );

    // Check badge is rendered with correct color
    const badge = screen.getByText('NEW');
    expect(badge).toHaveClass('text-purdue-gold');

    // Check title is rendered
    expect(screen.getByText('Feature Title')).toBeInTheDocument();
    expect(screen.getByText('Feature description')).toBeInTheDocument();
  });

  test('applies highlighted variant styling', () => {
    const { container } = render(
      <Card variant="highlighted">
        <p>Important content</p>
      </Card>
    );

    const card = container.firstChild;
    expect(card).toHaveClass('bg-purdue-gold', 'bg-opacity-10', 'border-purdue-gold');
  });
});
