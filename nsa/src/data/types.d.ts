export type Collection = {
  key: string;
  name: string;
};

export interface Product {
  id: string;
  title: string;
  price: string;
  images: {
      edges: Array<{
          node: {
              src: string;
          };
      }>;
  };
}
