import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders monitoring dashboard title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Live Monitoring Dashboard/i);
  expect(titleElement).toBeInTheDocument();
});
