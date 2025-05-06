import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Seller from './Seller';

// Mocking the fetch API call
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
    })
);

describe('Seller Component', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders the product form correctly', () => {
        render(
            <Seller
                cartProductIds={[]}
                setCartProductIds={() => {}}
                wishlistProductIds={[]}
                setWishlistProductIds={() => {}}
            />
        );

        expect(screen.getByLabelText('Product Name:')).toBeInTheDocument();
        expect(screen.getByLabelText('Description:')).toBeInTheDocument();
        expect(screen.getByLabelText('Price ($):')).toBeInTheDocument();
        expect(screen.getByLabelText('Product Image:')).toBeInTheDocument();
    });

    test('handles errors during product submission', async () => {
        // Mock fetch to return an error
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ message: 'Failed to add product' }),
            })
        );

        render(<Seller />);

        const productName = screen.getByLabelText('Product Name:');
        const description = screen.getByLabelText('Description:');
        const price = screen.getByLabelText('Price ($):');
        const fileInput = screen.getByLabelText('Product Image:');
        const submitButton = screen.getByText('Add Product');

        // Simulate entering product details
        fireEvent.change(productName, { target: { value: 'New Product' } });
        fireEvent.change(description, { target: { value: 'This is a new product' } });
        fireEvent.change(price, { target: { value: '150' } });
        fireEvent.change(fileInput, { target: { files: ['image.jpg'] } });

        // Simulate form submission
        fireEvent.click(submitButton);

        // Wait for error message
        await waitFor(() => expect(screen.getByText('Error: Failed to add product')).toBeInTheDocument());
    });

    test('alerts when "View Archive" is clicked', () => {
        // Mocking alert to prevent it from stopping the test
        window.alert = jest.fn();

        render(<Seller />);

        const viewArchiveButton = screen.getByText('View Archive');

        fireEvent.click(viewArchiveButton);

        expect(window.alert).toHaveBeenCalledWith('Redirecting to archive page...');
    });
});
