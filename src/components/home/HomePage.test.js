import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from './HomePage';

jest.mock('../../data/mockdata.json', () => [
    {
        id: 1,
        title: 'Product 1',
        price: 19.99,
        imageUrl: 'https://example.com/product1.jpg',
    },
    {
        id: 2,
        title: 'Product 2',
        price: 29.99,
        imageUrl: 'https://example.com/product2.jpg',
    },
    {
        id: 3,
        title: 'Product 3',
        price: 39.99,
        imageUrl: 'https://example.com/product3.jpg',
    },
]);

global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: 1, name: 'Category 1' }, { id: 2, name: 'Category 2' }]),
    })
);

describe('HomePage Component', () => {
    let setCartProductIds;
    let setWishlistProductIds;

    beforeEach(() => {
        setCartProductIds = jest.fn();
        setWishlistProductIds = jest.fn();
        fetch.mockClear();
    });

    it('renders correctly with initial state', async () => {
        render(
            <HomePage
                cartProductIds={[]}
                setCartProductIds={setCartProductIds}
                wishlistProductIds={[]}
                setWishlistProductIds={setWishlistProductIds}
            />
        );

        expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
        expect(screen.getByText('Price Range:')).toBeInTheDocument();
        expect(screen.getByText(/Listings/)).toBeInTheDocument();
    });

    it('renders products based on mock data', () => {
        render(
            <HomePage
                cartProductIds={[]}
                setCartProductIds={setCartProductIds}
                wishlistProductIds={[]}
                setWishlistProductIds={setWishlistProductIds}
            />
        );

        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.getByText('$19.99')).toBeInTheDocument();
        expect(screen.getByText('Product 2')).toBeInTheDocument();
        expect(screen.getByText('$29.99')).toBeInTheDocument();
    });

    it('handles search functionality', () => {
        render(
            <HomePage
                cartProductIds={[]}
                setCartProductIds={setCartProductIds}
                wishlistProductIds={[]}
                setWishlistProductIds={setWishlistProductIds}
            />
        );

        const searchInput = screen.getByPlaceholderText('Search...');
        fireEvent.change(searchInput, { target: { value: 'Product 1' } });
        const searchButton = screen.getByRole('button', { name: '' }); // Matches buttons without a name
        fireEvent.click(searchButton);

        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.queryByText('Product 2')).toBeNull();
    });

    it('adds a product to the cart', () => {
        render(
            <HomePage
                cartProductIds={[]}
                setCartProductIds={setCartProductIds}
                wishlistProductIds={[]}
                setWishlistProductIds={setWishlistProductIds}
            />
        );

        const addToCartButton = screen.getAllByText('Add to Cart')[0];
        fireEvent.click(addToCartButton);

        expect(setCartProductIds).toHaveBeenCalledWith(expect.any(Function));
    });

    it('adds a product to the wishlist', () => {
        render(
            <HomePage
                cartProductIds={[]}
                setCartProductIds={setCartProductIds}
                wishlistProductIds={[]}
                setWishlistProductIds={setWishlistProductIds}
            />
        );

        const addToWishlistButton = screen.getAllByText('Add to Wishlist')[0];
        fireEvent.click(addToWishlistButton);

        expect(setWishlistProductIds).toHaveBeenCalledWith(expect.any(Function));
    });

    it('handles price sorting', () => {
        render(
            <HomePage
                cartProductIds={[]}
                setCartProductIds={setCartProductIds}
                wishlistProductIds={[]}
                setWishlistProductIds={setWishlistProductIds}
            />
        );

        const sortButton = screen.getByText('No Price Sorting');
        fireEvent.click(sortButton);

        expect(screen.getByText('Lowest Price')).toBeInTheDocument();
    });

    it('fetches and renders categories', async () => {
        // Mock the fetch call to return category data
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([{ id: 1, name: 'Category 1' }, { id: 2, name: 'Category 2' }]),
            })
        );

        render(
            <HomePage
                cartProductIds={[]}
                setCartProductIds={setCartProductIds}
                wishlistProductIds={[]}
                setWishlistProductIds={setWishlistProductIds}
            />
        );

        // Open the dropdown by interacting with it
        const dropdown = screen.getByRole('combobox');
        fireEvent.mouseDown(dropdown);

        // Check if the categories are visible after interacting with the dropdown
        expect(await screen.findByText('Category 1')).toBeInTheDocument();
        expect(await screen.findByText('Category 2')).toBeInTheDocument();

        // Clean up after the test
        jest.restoreAllMocks();
    });

});
