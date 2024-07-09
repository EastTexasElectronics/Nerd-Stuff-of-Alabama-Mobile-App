import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import SearchBar from '../components/search_bar';
import { searchShopify } from '../services/shopify_queries';

jest.mock('../services/shopify_queries');

describe('SearchBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the search input', () => {
    const { getByPlaceholderText } = render(<SearchBar />);
    const inputElement = getByPlaceholderText(/search products/i);
    expect(inputElement).toBeTruthy();
  });

  it('shows no results found message when there are no results', async () => {
    (searchShopify as jest.Mock).mockResolvedValueOnce({ products: [], collections: [] });

    const { getByPlaceholderText, getByText } = render(<SearchBar />);
    const inputElement = getByPlaceholderText(/search products/i);
    fireEvent.changeText(inputElement, 'nonexistentproduct');

    await waitFor(() => {
      expect(getByText(/no results found/i)).toBeVisible();
    });
  });

  it('clears the search input when the clear button is clicked', () => {
    const { getByPlaceholderText, getByRole } = render(<SearchBar />);
    const inputElement = getByPlaceholderText(/search products/i);
    fireEvent.changeText(inputElement, 'test');

    const clearButton = getByRole('button');
    fireEvent.press(clearButton);

    expect(inputElement.props.value).toBe('');
  });
});
