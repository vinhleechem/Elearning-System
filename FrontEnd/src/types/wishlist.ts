export interface WishlistResponse {
    wishlistId: number;
    courseId: number;
    courseTitle: string;
    courseImage: string;
    price: number;
    discountPrice?: number;
    instructorName: string;
    rating: number;
    addedAt: string;
}
