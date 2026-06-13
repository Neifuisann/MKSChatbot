"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarCheck,
  CheckCircle2,
  LoaderCircle,
  MapPin,
  PackageCheck,
  Send,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import {
  checkMakerspaceAvailability,
  submitMakerspaceBooking,
  type MakerspaceActionResult,
} from "@/app/(workspace)/makerspace/actions";
import type {
  MakerspaceAvailability,
  MakerspaceResource,
} from "@/lib/makerspace/store";
import type { MakerspaceResourceCategory } from "@/schemas/makerspace-booking";
import { cn } from "@/lib/utils";

const categoryLabels: Record<MakerspaceResourceCategory, string> = {
  equipment: "Thiết bị",
  fabrication: "In 3D & gia công",
  space: "Không gian",
  tool: "Dụng cụ",
};

const formSchema = z.object({
  attendeeCount: z.number().int().min(1, "Cần ít nhất 1 người."),
  date: z.string().min(1, "Vui lòng chọn ngày."),
  endTime: z.string().min(1, "Vui lòng chọn giờ kết thúc."),
  notes: z.string().max(1000, "Ghi chú không được vượt quá 1.000 ký tự."),
  purpose: z
    .string()
    .trim()
    .min(10, "Mục đích sử dụng cần ít nhất 10 ký tự.")
    .max(1000, "Mục đích không được vượt quá 1.000 ký tự."),
  quantity: z.number().int().min(1, "Số lượng phải từ 1 trở lên."),
  resourceId: z.string().uuid("Vui lòng chọn tài nguyên."),
  startTime: z.string().min(1, "Vui lòng chọn giờ bắt đầu."),
});

type BookingFormValues = z.infer<typeof formSchema>;

type MakerspaceBookingFormProps = {
  resources: MakerspaceResource[];
};

function toBookingInput(values: BookingFormValues) {
  return {
    attendeeCount: values.attendeeCount,
    endsAt: new Date(`${values.date}T${values.endTime}:00`).toISOString(),
    notes: values.notes,
    purpose: values.purpose,
    quantity: values.quantity,
    resourceId: values.resourceId,
    startsAt: new Date(`${values.date}T${values.startTime}:00`).toISOString(),
  };
}

export function MakerspaceBookingForm({
  resources,
}: MakerspaceBookingFormProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] =
    useState<MakerspaceResourceCategory>("space");
  const [availability, setAvailability] = useState<MakerspaceAvailability>();
  const [result, setResult] = useState<MakerspaceActionResult>();
  const [isChecking, startChecking] = useTransition();
  const [isSubmitting, startSubmitting] = useTransition();
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    control,
  } = useForm<BookingFormValues>({
    defaultValues: {
      attendeeCount: 1,
      date: "",
      endTime: "",
      notes: "",
      purpose: "",
      quantity: 1,
      resourceId: "",
      startTime: "",
    },
    resolver: zodResolver(formSchema),
  });

  const selectedResourceId = useWatch({ control, name: "resourceId" });
  const selectedResource = resources.find(
    (resource) => resource.id === selectedResourceId,
  );
  const visibleResources = resources.filter(
    (resource) => resource.category === activeCategory,
  );

  const runAvailabilityCheck = handleSubmit((values) => {
    setResult(undefined);
    setAvailability(undefined);
    startChecking(async () => {
      const response = await checkMakerspaceAvailability(toBookingInput(values));
      if (response.error) {
        setResult({ error: response.error });
        return;
      }
      setAvailability(response);
    });
  });

  const submitBooking = handleSubmit((values) => {
    setResult(undefined);
    startSubmitting(async () => {
      const response = await submitMakerspaceBooking(toBookingInput(values));
      setResult(response);
      if (response.success) {
        setAvailability(undefined);
        reset();
        router.refresh();
      }
    });
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
      <section className="rounded-[1.75rem] border border-[#e2ddd3] bg-[#fffdfa]/90 p-5 shadow-[0_18px_50px_rgba(67,74,61,0.07)] sm:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-[#e8e3d9] pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a35d46]">
              Bước 1
            </p>
            <h2 className="mt-2 font-serif text-2xl text-[#294536]">
              Chọn nơi hoặc thiết bị
            </h2>
          </div>
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#f3e6df] text-[#9b5b46]">
            <PackageCheck className="size-4.5" />
          </span>
        </div>

        <div
          aria-label="Nhóm tài nguyên"
          className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4"
          role="tablist"
        >
          {(Object.keys(categoryLabels) as MakerspaceResourceCategory[]).map(
            (category) => (
              <button
                aria-selected={activeCategory === category}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-xs font-medium transition",
                  activeCategory === category
                    ? "border-[#7e9b89] bg-[#e8f0ea] text-[#315a45]"
                    : "border-[#e3ded4] bg-[#fbfaf6] text-[#68766f] hover:border-[#cfc8bd] hover:bg-white",
                )}
                key={category}
                onClick={() => setActiveCategory(category)}
                role="tab"
                type="button"
              >
                {categoryLabels[category]}
              </button>
            ),
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {visibleResources.map((resource) => {
            const isSelected = selectedResourceId === resource.id;
            return (
              <button
                aria-pressed={isSelected}
                className={cn(
                  "rounded-2xl border p-4 text-left transition",
                  isSelected
                    ? "border-[#789682] bg-[#edf3ed] shadow-[0_8px_24px_rgba(63,91,73,0.1)]"
                    : "border-[#e3ded4] bg-[#fbfaf6] hover:border-[#cfc8bd] hover:bg-white",
                )}
                key={resource.id}
                onClick={() => {
                  setValue("resourceId", resource.id, { shouldValidate: true });
                  setAvailability(undefined);
                }}
                type="button"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="font-medium text-[#31473b]">{resource.name}</span>
                  {isSelected ? (
                    <CheckCircle2 className="size-4.5 shrink-0 text-[#3e7557]" />
                  ) : null}
                </span>
                <span className="mt-2 block text-xs leading-5 text-[#7a857f]">
                  {resource.description}
                </span>
                <span className="mt-3 flex items-center gap-1.5 text-[11px] text-[#8b928e]">
                  <MapPin className="size-3.5" />
                  {resource.location}
                </span>
              </button>
            );
          })}
        </div>
        {errors.resourceId ? (
          <p className="mt-3 text-xs text-[#a24f3c]">{errors.resourceId.message}</p>
        ) : null}
      </section>

      <form
        className="rounded-[1.75rem] border border-[#e2ddd3] bg-[#fffdfa]/90 p-5 shadow-[0_18px_50px_rgba(67,74,61,0.07)] sm:p-7"
        onSubmit={submitBooking}
      >
        <div className="border-b border-[#e8e3d9] pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a35d46]">
            Bước 2
          </p>
          <h2 className="mt-2 font-serif text-2xl text-[#294536]">
            Chọn lịch và gửi đăng ký
          </h2>
          <p className="mt-2 text-xs leading-5 text-[#7a857f]">
            Kiểm tra lịch trống trước khi gửi. Hệ thống sẽ kiểm tra lại khi tạo
            phiếu để tránh trùng lịch.
          </p>
        </div>

        {selectedResource ? (
          <div className="mt-5 rounded-2xl border border-[#d9e3dc] bg-[#edf3ed] px-4 py-3">
            <p className="font-medium text-[#315a45]">{selectedResource.name}</p>
            <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#66776d]">
              <span>Tối đa {selectedResource.maxPeople} người</span>
              <span>{selectedResource.capacity} đơn vị khả dụng</span>
              <span>{selectedResource.autoApprove ? "Duyệt tự động" : "Duyệt thủ công"}</span>
            </p>
          </div>
        ) : null}

        <fieldset className="mt-5 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField error={errors.date?.message} label="Ngày sử dụng">
              <input
                className={inputClass}
                min={new Date().toISOString().slice(0, 10)}
                type="date"
                {...register("date")}
              />
            </FormField>
            <FormField error={errors.attendeeCount?.message} label="Số người">
              <input
                className={inputClass}
                min={1}
                type="number"
                {...register("attendeeCount", { valueAsNumber: true })}
              />
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField error={errors.startTime?.message} label="Bắt đầu">
              <input className={inputClass} type="time" {...register("startTime")} />
            </FormField>
            <FormField error={errors.endTime?.message} label="Kết thúc">
              <input className={inputClass} type="time" {...register("endTime")} />
            </FormField>
          </div>
          <FormField error={errors.quantity?.message} label="Số lượng cần dùng">
            <input
              className={inputClass}
              max={selectedResource?.capacity}
              min={1}
              type="number"
              {...register("quantity", { valueAsNumber: true })}
            />
          </FormField>
          <FormField error={errors.purpose?.message} label="Mục đích sử dụng">
            <textarea
              className={`${inputClass} min-h-24 resize-y py-3`}
              placeholder="Mô tả ngắn hoạt động, dự án hoặc sản phẩm bạn dự định thực hiện..."
              {...register("purpose")}
            />
          </FormField>
          <FormField error={errors.notes?.message} label="Ghi chú cho Makerspace (không bắt buộc)">
            <textarea
              className={`${inputClass} min-h-20 resize-y py-3`}
              placeholder="Yêu cầu hỗ trợ, vật liệu dự kiến hoặc lưu ý an toàn..."
              {...register("notes")}
            />
          </FormField>
        </fieldset>

        {availability ? (
          <div
            className={cn(
              "mt-5 rounded-2xl border px-4 py-3 text-sm",
              availability.isAvailable
                ? "border-[#bfd5c5] bg-[#eaf3eb] text-[#356249]"
                : "border-[#dfb8a9] bg-[#f8eae4] text-[#8b4935]",
            )}
          >
            {availability.isAvailable
              ? `Khung giờ còn ${availability.available} đơn vị. Bạn có thể gửi đăng ký.`
              : `Khung giờ chỉ còn ${availability.available} đơn vị. Hãy chọn lịch hoặc số lượng khác.`}
          </div>
        ) : null}
        {result?.error ? (
          <p className="mt-5 rounded-2xl border border-[#dfb8a9] bg-[#f8eae4] px-4 py-3 text-sm text-[#8b4935]">
            {result.error}
          </p>
        ) : null}
        {result?.success ? (
          <p className="mt-5 rounded-2xl border border-[#bfd5c5] bg-[#eaf3eb] px-4 py-3 text-sm text-[#356249]">
            {result.success}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#e8e3d9] pt-5 sm:flex-row sm:justify-end">
          <button
            className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#cfc9bf] bg-[#fbfaf6] px-5 text-sm font-medium text-[#536159] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isChecking || isSubmitting}
            onClick={runAvailabilityCheck}
            type="button"
          >
            {isChecking ? <LoaderCircle className="size-4 animate-spin" /> : <CalendarCheck className="size-4" />}
            Kiểm tra lịch trống
          </button>
          <button
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#275641] px-6 text-sm font-medium text-white shadow-[0_10px_24px_rgba(39,86,65,0.18)] transition hover:bg-[#1f4635] disabled:cursor-not-allowed disabled:bg-[#a6afa9] disabled:shadow-none"
            disabled={!availability?.isAvailable || isChecking || isSubmitting}
            type="submit"
          >
            {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
            Gửi đăng ký
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-[#dcd7cc] bg-white px-3.5 text-sm text-[#263d31] outline-none transition placeholder:text-[#a6ada9] focus:border-[#799483] focus:ring-3 focus:ring-[#799483]/15";

function FormField({
  children,
  error,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-xs font-medium text-[#4b5e54]">
      <span>{label}</span>
      {children}
      {error ? <span className="text-[#a24f3c]">{error}</span> : null}
    </label>
  );
}
