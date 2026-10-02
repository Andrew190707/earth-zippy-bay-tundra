export type SikkuDrop = {
  name: string;
  slug: string;
  productCount: number;
  eyebrow: string;
  summary: string;
  products: string[];
  image?: string;
  compareAtPrice?: number;
  price: number;
};

export const SIKKU_DROPS: SikkuDrop[] = [
  {
    name: "Sikku Drop 01",
    slug: "sikku-drop-01",
    productCount: 6,
    eyebrow: "DROP 01",
    summary: "Six kolam tees built around black, graphic, everyday silhouettes.",
    products: [
      "Hod Kolam Tee",
      "Godzilla Kolam Tee",
      "Spidey Kolam Tee",
      "Kaali Kolam Tee",
      "Wolf Kolam Tee",
      "Skull Kolam Tee",
    ],
    price: 750,
  },
  {
    name: "Sikku Drop 02",
    slug: "sikku-drop-02",
    productCount: 5,
    eyebrow: "DROP 02",
    summary: "Five new variations, including the photographed Spidey Ver 2.",
    products: [
      "Spidey Kolam Tee Ver 2",
      "Spidey Kolam Tee Ver 3",
      "Skull Ver 2",
      "Snake Kolam Tee",
      "Swan Kolam Tee",
    ],
    image: "/products/sikku-02/spidey-ver2-01.jpg",
    compareAtPrice: 899,
    price: 750,
  },
];
