// src/services/shopify_queries.ts
import client from "./shopify_client";

// GET_PRODUCTS_QUERY

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
          variants(first: 1) {
            edges {
              node {
                priceV2 {
                  amount
                  currencyCode
                }
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
    // console.log("Response from Shopify:", JSON.stringify(response, null, 2)); // Detailed logging

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

// GET_PRODUCT_QUERY

interface PriceRange {
  minVariantPrice: {
    amount: string;
    currencyCode: string;
  };
  maxVariantPrice: {
    amount: string;
    currencyCode: string;
  };
}

interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  priceV2: {
    amount: string;
    currencyCode: string;
  };
  compareAtPriceV2: {
    amount: string;
    currencyCode: string;
  } | null;
  selectedOptions: {
    name: string;
    value: string;
  }[];
}

interface ProductImage {
  node: {
    originalSrc: string;
  };
}

export interface Product {
  id: string;
  title: string;
  descriptionHtml: string;
  availableForSale: boolean;
  compareAtPriceRange: PriceRange;
  priceRange: PriceRange;
  productType: string;
  publishedAt: string;
  tags: string[];
  totalInventory: number;
  trackingParameters: string;
  vendor: string;
  options: ProductOption[];
  images: {
    edges: ProductImage[];
  };
  variants: {
    edges: {
      node: ProductVariant;
    }[];
  };
}

const GET_PRODUCT_QUERY = `
  query GetProduct($productId: ID!) {
    product(id: $productId) {
      id
      title
      descriptionHtml
      availableForSale
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      productType
      publishedAt
      tags
      totalInventory
      trackingParameters
      vendor
      options {
        id
        name
        values
      }
      images(first: 10) {
        edges {
          node {
            originalSrc
          }
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            availableForSale
            quantityAvailable
            priceV2 {
              amount
              currencyCode
            }
            compareAtPriceV2 {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  }
`;

export const fetchProduct = async (productId: string): Promise<Product> => {
  console.log(`Fetching product with ID: ${productId}`);
  try {
    const response = await client.request(GET_PRODUCT_QUERY, {
      variables: { productId },
    });
    
    console.log('Raw response from Shopify:', JSON.stringify(response, null, 2));
    
    if (response.data && response.data.product) {
      const rawProduct = response.data.product;
      console.log('Raw product data:', JSON.stringify(rawProduct, null, 2));
      
      // Transform and validate the data
      const product: Product = {
        ...rawProduct,
        totalInventory: rawProduct.totalInventory ?? 0,
        availableForSale: rawProduct.availableForSale ?? false,
        productType: rawProduct.productType || 'N/A',
        vendor: rawProduct.vendor || 'N/A',
        publishedAt: rawProduct.publishedAt ? new Date(rawProduct.publishedAt).toLocaleDateString() : 'N/A',
        tags: rawProduct.tags && rawProduct.tags.length > 0 ? rawProduct.tags : ['No tags'],
        trackingParameters: rawProduct.trackingParameters || '',
        variants: {
          edges: rawProduct.variants.edges.map((edge: { node: ProductVariant }) => ({
            node: {
              ...edge.node,
              quantityAvailable: edge.node.quantityAvailable ?? 0,
              availableForSale: edge.node.availableForSale ?? false,
            }
          }))
        }
      };

      console.log('Transformed product data:', JSON.stringify(product, null, 2));
      return product;
    } else {
      console.error('Product not found in response:', response);
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error("Error in fetchProduct:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw new Error("Could not fetch product");
  }
};

// SEARCH_QUERY

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
                url
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                priceV2 {
                  amount
                  currencyCode
                }
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
    const response = await client.request(SEARCH_QUERY, {
      variables: { query },
    });
    // console.log(
    //   "Search response from Shopify:",
    //   JSON.stringify(response, null, 2)
    // ); // Detailed logging

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

// GET_COLLECTION_PRODUCTS_QUERY

const GET_COLLECTION_PRODUCTS_QUERY = `
  query GetCollectionProducts($collectionId: ID!, $first: Int!, $after: String, $before: String) {
    collection(id: $collectionId) {
      products(first: $first, after: $after, before: $before) {
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
            variants(first: 1) {
              edges {
                node {
                  priceV2 {
                    amount
                    currencyCode
                  }
                  availableForSale
                }
              }
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
`;

export const fetchCollectionProducts = async (
  collectionId: string,
  first: number,
  after?: string,
  before?: string
) => {
  try {
    const response = await client.request(GET_COLLECTION_PRODUCTS_QUERY, {
      variables: { collectionId, first, after, before },
    });

    // console.log("Response from Shopify:", JSON.stringify(response, null, 2));

    if (response.errors) {
      console.error("GraphQL errors:", response.errors);
      throw new Error("GraphQL errors occurred");
    }

    if (
      response.data &&
      response.data.collection &&
      response.data.collection.products
    ) {
      return response.data.collection.products;
    } else {
      console.error("Invalid response structure", response);
      throw new Error("Invalid response structure");
    }
  } catch (error) {
    console.error("Error fetching collection products:", error);
    throw new Error("Could not fetch collection products");
  }
};
