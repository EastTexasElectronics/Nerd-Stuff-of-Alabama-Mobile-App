import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import PreOrderGrid from '@/components/preorder_grid';
import { fetchCollectionProducts } from '@/services/shopify_queries';

jest.mock('@/services/shopify_queries');

const mockFetchCollectionProducts = fetchCollectionProducts as jest.MockedFunction<typeof fetchCollectionProducts>;

const mockProducts = {
  edges: [
    {
      node: {
        id: '1',
        title: 'Product 1',
        variants: { edges: [{ node: { priceV2: { amount: '10.00' } } }] },
        images: { edges: [{ node: { src: 'http://example.com/image1.jpg' } }] },
      },
    },
    {
      node: {
        id: '2',
        title: 'Product 2',
        variants: { edges: [{ node: { priceV2: { amount: '20.00' } } }] },
        images: { edges: [{ node: { src: 'http://example.com/image2.jpg' } }] },
      },
    },
  ],
  pageInfo: {
    hasNextPage: true,
    hasPreviousPage: false,
    startCursor: 'cursor1',
    endCursor: 'cursor2',
  },
};

describe('PreOrderGrid', () => {
  beforeEach(() => {
    mockFetchCollectionProducts.mockResolvedValue(mockProducts);
  });

  it('renders correctly and fetches products', async () => {
    const { getByText, getAllByText } = render(<PreOrderGrid />);
    
    await waitFor(() => expect(mockFetchCollectionProducts).toHaveBeenCalledTimes(1));

    expect(getByText('Upcoming Releases')).toBeTruthy();
    expect(getAllByText(/Product/).length).toBe(2);
    expect(getByText('$10.00')).toBeTruthy();
    expect(getByText('$20.00')).toBeTruthy();
  });

  it('handles swipe gestures', async () => {
    const { getByLabelText, getAllByText } = render(<PreOrderGrid />);
    
    await waitFor(() => expect(mockFetchCollectionProducts).toHaveBeenCalledTimes(1));

    fireEvent.press(getByLabelText('Next page'));

    await waitFor(() => expect(mockFetchCollectionProducts).toHaveBeenCalledTimes(2));

    fireEvent.press(getByLabelText('Previous page'));

    expect(getAllByText(/Product/).length).toBe(2);
  });

  it('displays error message on fetch failure', async () => {
    mockFetchCollectionProducts.mockRejectedValueOnce(new Error('Failed to fetch'));

    const { getByText } = render(<PreOrderGrid />);

    await waitFor(() => expect(mockFetchCollectionProducts).toHaveBeenCalledTimes(1));

    expect(getByText('Error fetching collection products: Failed to fetch')).toBeTruthy();
  });
});
