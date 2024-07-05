// src/services/shopify_client.ts
import { createStorefrontApiClient } from "@shopify/storefront-api-client";

const client = createStorefrontApiClient({
  storeDomain: "nerd-stuff-of-alabama.myshopify.com",
  apiVersion: "2024-07",
  publicAccessToken: "41eaa6ac48bd8caf9c15b5fdc9aa67f7",
});

export default client;
