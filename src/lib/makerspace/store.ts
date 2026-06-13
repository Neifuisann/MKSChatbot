import "server-only";

import {
  calculateAvailableQuantity,
  type AvailabilitySummary,
} from "@/lib/makerspace/availability";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  MakerspaceBookingInput,
  MakerspaceBookingStatus,
  MakerspaceResourceCategory,
} from "@/schemas/makerspace-booking";

export type MakerspaceResource = {
  autoApprove: boolean;
  capacity: number;
  category: MakerspaceResourceCategory;
  description: string;
  id: string;
  location: string;
  maxPeople: number;
  name: string;
};

export type MakerspaceBooking = {
  attendeeCount: number;
  createdAt: string;
  endsAt: string;
  id: string;
  purpose: string;
  quantity: number;
  resourceName: string;
  startsAt: string;
  status: MakerspaceBookingStatus;
};

export type MakerspaceAvailability = AvailabilitySummary;

function mapResource(row: Record<string, unknown>): MakerspaceResource {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as MakerspaceResourceCategory,
    description: row.description as string,
    location: row.location as string,
    capacity: row.capacity as number,
    maxPeople: row.max_people as number,
    autoApprove: row.auto_approve as boolean,
  };
}

export async function listMakerspaceResources(): Promise<MakerspaceResource[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("makerspace_resources")
    .select("id, name, category, description, location, capacity, max_people, auto_approve")
    .eq("is_active", true)
    .order("category")
    .order("name");

  if (error) throw error;
  return (data ?? []).map((row) => mapResource(row));
}

export async function listUserMakerspaceBookings(
  userId: string,
): Promise<MakerspaceBooking[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("makerspace_bookings")
    .select(
      "id, starts_at, ends_at, quantity, attendee_count, purpose, status, created_at, makerspace_resources(name)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return (data ?? []).map((row) => {
    const resource = row.makerspace_resources as unknown as { name: string };
    return {
      id: row.id,
      resourceName: resource.name,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      quantity: row.quantity,
      attendeeCount: row.attendee_count,
      purpose: row.purpose,
      status: row.status as MakerspaceBookingStatus,
      createdAt: row.created_at,
    };
  });
}

export async function getMakerspaceAvailability(
  input: Pick<
    MakerspaceBookingInput,
    "endsAt" | "quantity" | "resourceId" | "startsAt"
  >,
): Promise<MakerspaceAvailability> {
  const admin = createSupabaseAdminClient();
  const [{ data: resource, error: resourceError }, { data: bookings, error: bookingsError }] =
    await Promise.all([
      admin
        .from("makerspace_resources")
        .select("capacity")
        .eq("id", input.resourceId)
        .eq("is_active", true)
        .maybeSingle(),
      admin
        .from("makerspace_bookings")
        .select("quantity")
        .eq("resource_id", input.resourceId)
        .in("status", ["pending", "approved"])
        .lt("starts_at", input.endsAt)
        .gt("ends_at", input.startsAt),
    ]);

  if (resourceError) throw resourceError;
  if (bookingsError) throw bookingsError;
  if (!resource) throw new Error("MAKERSPACE_RESOURCE_NOT_FOUND");

  return calculateAvailableQuantity(
    resource.capacity,
    (bookings ?? []).map((booking) => booking.quantity),
    input.quantity,
  );
}

export async function createMakerspaceBooking(
  input: MakerspaceBookingInput & { userId: string },
): Promise<void> {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.rpc("create_makerspace_booking", {
    p_attendee_count: input.attendeeCount,
    p_ends_at: input.endsAt,
    p_notes: input.notes || null,
    p_purpose: input.purpose,
    p_quantity: input.quantity,
    p_resource_id: input.resourceId,
    p_starts_at: input.startsAt,
    p_user_id: input.userId,
  });

  if (error) throw error;
}
