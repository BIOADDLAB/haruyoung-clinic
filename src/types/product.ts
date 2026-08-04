export type Product = {
    id: string;
    menuCategory: string;
    menuSlug: string;
    subCategory: string;
    name: string;
    highlight: string;
    description: string;
    price: number | null;
    order: number;
};

export type ProductSeed = Omit<Product, 'id'>;
