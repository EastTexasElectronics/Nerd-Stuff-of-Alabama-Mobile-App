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

// Deferred Fetch Products

// const GET_DEFERRED_PRODUCTS_QUERY = `
//   query GET_DEFERRED_PRODUCTS_QUERY($handle: String) {
//     product(handle: $handle) {
//       id
//       handle
//       ... @defer(label: "deferredFields") {
//         title
//         description
//       }
//     }
//   }
// `;

// // Fetch Products Stream

// const responseStream = await client.requestStream(GET_DEFERRED_PRODUCTS_QUERY, {
//   variables: { handle: "sample-product" },
// });

// // await available data from the async iterator
// for await (const response of responseStream) {
//   const { data, errors, extensions, hasNext } = response;
// }

// // Fetch Shop Info
// const GET_SHOP_QUERY = `
//   query shop {
//     shop {
//       name
//       id
//     }
//   }
// `;

// export const fetchShop = async () => {
//   try {
//     const response = await client.request(GET_SHOP_QUERY);
//     console.log("Response from Shopify:", response);
//     if (response && response.data && response.data.shop) {
//       return response.data.shop;
//     } else {
//       throw new Error("Invalid response structure");
//     }
//   } catch (error) {
//     console.error("Error fetching shop:", error);
//     throw new Error("Could not fetch shop");
//   }
// };

// // Fetch Collections
// const GET_COLLECTIONS_QUERY = `
//   {
//     collections(first: 10) {
//       edges {
//         node {
//           id
//           title
//           description
//           image {
//             url
//           }
//         }
//       }
//     }
//   }
// `;

// export const fetchCollections = async () => {
//   try {
//     const response = await client.request(GET_COLLECTIONS_QUERY);
//     console.log("Response from Shopify:", response);
//     if (response && response.data && response.data.collections) {
//       return response.data.collections.edges;
//     } else {
//       throw new Error("Invalid response structure");
//     }
//   } catch (error) {
//     console.error("Error fetching collections:", error);
//     throw new Error("Could not fetch collections");
//   }
// };
