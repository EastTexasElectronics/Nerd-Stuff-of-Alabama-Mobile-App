// shopify_queries.ts
import client from "./shopify_client";

const GET_PRODUCTS_QUERY = `
  {
    products(first: 10) {
      edges {
        node {
          id
          title
          description
          images(first: 1) {
            edges {
              node {
                src
              }
            }
          }
        }
      }
    }
  }
`;

export const fetchProducts = async () => {
  try {
    const response = await client.request(GET_PRODUCTS_QUERY);
    console.log("Response from Shopify:", JSON.stringify(response, null, 2)); // Detailed logging

    if (response.data && response.data.products) {
      return response.data.products.edges;
    } else {
      throw new Error("Invalid response structure");
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Could not fetch products");
  }
};

const SEARCH_QUERY = `
  query Search($query: String!) {
    products(first: 10, query: $query) {
      edges {
        node {
          id
          title
          description
          images(first: 1) {
            edges {
              node {
                src
              }
            }
          }
        }
      }
    }
    collections(first: 10, query: $query) {
      edges {
        node {
          id
          title
          description
          image {
            src
          }
        }
      }
    }
  }
`;

export const searchShopify = async (query: string) => {
  try {
    const response = await client.request(SEARCH_QUERY, { variables: { query } });
    console.log("Search response from Shopify:", JSON.stringify(response, null, 2)); // Detailed logging

    if (response.data) {
      return {
        products: response.data.products.edges,
        collections: response.data.collections.edges,
      };
    } else {
      throw new Error("Invalid search response structure");
    }
  } catch (error) {
    console.error("Error searching Shopify:", error);
    throw new Error("Could not perform search");
  }
};
