import React from 'react';
import { render } from '@testing-library/react';

test('renders without crashing', () => {
    render(<h1>Test</h1>);
    expect(true).toBe(true);
});