import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Cart from './Cart';

jest.mock('../../data/mockdata.json', () => [
    {
        id: 1,
        title: 'Product 1',
        description: 'Description for Product 1',
        price: 19.99,
        imageUrl: 'https://example.com/product1.jpg',
    },
    {
        id: 2,
        title: 'Product 2',
        description: 'Description for Product 2',
        price: 29.99,
        imageUrl: 'https://example.com/product2.jpg',
    },
    {
        id: 3,
        title: 'Product 3',
        description: 'Description for Product 3',
        price: 39.99,
        imageUrl: 'https://example.com/product3.jpg',
    },
]);

describe('Cart Component', () => {
    it('renders correctly with empty cart', () => {
        render(<Cart productIds={[]} setProductIds={jest.fn()} />);

        expect(screen.getByText(/Your Cart \(0 items\)/)).toBeInTheDocument();
        expect(screen.getByText('Total: $0.00')).toBeInTheDocument();
        expect(screen.queryByAltText(/Product/)).toBeNull();
    });

    it('renders cart items correctly', () => {
        render(<Cart productIds={[1, 2]} setProductIds={jest.fn()} />);

        expect(screen.getByText(/Your Cart \(2 items\)/)).toBeInTheDocument();
        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.getByText('Product 2')).toBeInTheDocument();
        expect(screen.getByText('Description for Product 1')).toBeInTheDocument();
        expect(screen.getByText('Description for Product 2')).toBeInTheDocument();
        expect(screen.getByAltText('Product 1')).toBeInTheDocument();
        expect(screen.getByAltText('Product 2')).toBeInTheDocument();
    });

    it('calculates the total price correctly', () => {
        render(<Cart productIds={[1, 3]} setProductIds={jest.fn()} />);

        expect(screen.getByText(/Your Cart \(2 items\)/)).toBeInTheDocument();
        expect(screen.getByText('Total: $59.98')).toBeInTheDocument();
    });

    it('renders "Check out" button', () => {
        render(<Cart productIds={[2]} setProductIds={jest.fn()} />);

        expect(screen.getByRole('button', { name: 'Check out' })).toBeInTheDocument();
    });
});
