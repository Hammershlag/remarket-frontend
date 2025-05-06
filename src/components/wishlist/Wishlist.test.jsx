import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Wishlist from './Wishlist';  // Adjust path as needed
import mockData from '../../data/mockdata.json';

describe('Wishlist Component', () => {
    let setProductIds;
    let setCartProductIds;

    beforeEach(() => {
        // Mock the state setters
        setProductIds = jest.fn();
        setCartProductIds = jest.fn();

        // Mock initial product IDs in the wishlist
        const productIds = [mockData[0].id, mockData[1].id];

        render(
            <Wishlist
                productIds={productIds}
                setProductIds={setProductIds}
                setCartProductIds={setCartProductIds}
            />
        );
    });

    it('renders the wishlist with products', () => {
        // Mock the productIds and setCartProductIds
        const productIds = [1, 2];  // Mocking the product IDs you want in the wishlist
        const setProductIds = jest.fn();  // Mocking the setProductIds function
        const setCartProductIds = jest.fn();  // Mocking the setCartProductIds function

        // Render the Wishlist component with props
        render(
            <Wishlist
                productIds={productIds}
                setProductIds={setProductIds}
                setCartProductIds={setCartProductIds}
            />
        );

        // Get all the rows in the table and find the correct one with the title
        const rows = screen.getAllByText('Vintage Wooden Chair');
        expect(rows[0]).toBeInTheDocument(); // Assert the element is in the document
    });

    it('adds a product to the cart', () => {
        // Get all "Add to Cart" buttons
        const addToCartButtons = screen.getAllByRole('button', { name: /Add to Cart/i });

        // Simulate clicking the first "Add to Cart" button
        fireEvent.click(addToCartButtons[0]);

        // Verify that the setCartProductIds function was called with the correct product id
        expect(setCartProductIds).toHaveBeenCalledWith(expect.any(Function));
    });


    it('removes a product from the wishlist', () => {
        // Find the button by its role and text, then click the first one
        const removeButtons = screen.getAllByRole('button', { name: /Remove from Wishlist/i });

        // We can simulate removing the first item for this example
        fireEvent.click(removeButtons[0]);

        // Verify that the setProductIds function was called to remove the product
        expect(setProductIds).toHaveBeenCalledWith(expect.any(Function));
    });

    it('displays product price correctly', () => {
        const product = mockData[0];
        expect(screen.getByText(`$${product.price.toFixed(2)}`)).toBeInTheDocument();
    });
});
