// src/data/pages/home_page/home_page.d.ts
// In this file we will provide the data that will be rendered on the home page.

import { Collection } from "../../../components/promoted_collection_list";

// Promoted Collections Banner
export const collections: Collection[] = [
  { key: "funko_pops", name: "Funko Pops" },
  { key: "pre_orders", name: "Pre-Orders" },
  { key: "on_sale", name: "On Sale" },
  { key: "all_collections", name: "All Collections" },
];

// Slideshow
export const slideshowImages = [
  {
    url: require("../../../assets/images/1.png"),
    link: "https://example.com/page1",
  },
  {
    url: require("../../../assets/images/2.png"),
    link: "https://example.com/page2",
  },
  {
    url: require("../../../assets/images/3.png"),
    link: "https://example.com/page3",
  },
];


