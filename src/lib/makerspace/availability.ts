export type AvailabilitySummary = {
  available: number;
  isAvailable: boolean;
  requested: number;
};

export function calculateAvailableQuantity(
  capacity: number,
  bookedQuantities: number[],
  requested: number,
): AvailabilitySummary {
  const booked = bookedQuantities.reduce((total, quantity) => total + quantity, 0);
  const available = Math.max(0, capacity - booked);

  return {
    available,
    isAvailable: available >= requested,
    requested,
  };
}
