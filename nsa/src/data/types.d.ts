export type Collection = {
  key: string;
  name: string;
};
// from preorder_grid.tsx
export default interface Product {
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
