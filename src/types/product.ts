export type Product = {
    id: string;
    name: string;
    mainCategory: string;
    subCategory: string;
    highlight: string;
    description: string;
    price: number;
    discountPrice: number;
    eventId: string | null;
};
