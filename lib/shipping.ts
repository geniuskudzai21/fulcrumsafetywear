export const DELIVERY_FEE = 5;
export const BULK_DELIVERY_MIN_ITEMS = 6;

export function deliveryFeeForQuantity(quantity: number): number {
  return quantity >= BULK_DELIVERY_MIN_ITEMS
    ? DELIVERY_FEE / 2
    : DELIVERY_FEE;
}
