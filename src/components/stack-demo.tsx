"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  stackCheckSchema,
  type StackCheckInput,
} from "@/schemas/stack-check";

type StackItem = {
  technology: string;
  purpose: string;
};

const stackItems: StackItem[] = [
  { technology: "Next.js App Router", purpose: "Application framework" },
  { technology: "Tailwind CSS + shadcn/ui", purpose: "UI system" },
  { technology: "React Hook Form + Zod", purpose: "Validated forms" },
  { technology: "TanStack Table", purpose: "Admin data tables" },
  { technology: "AI SDK + providers", purpose: "Streaming and tools" },
  { technology: "Supabase", purpose: "Database, auth, storage, vectors" },
  { technology: "Inngest", purpose: "Background jobs" },
  { technology: "Vitest", purpose: "Automated tests" },
];

const columnHelper = createColumnHelper<StackItem>();
const columns = [
  columnHelper.accessor("technology", { header: "Technology" }),
  columnHelper.accessor("purpose", { header: "Purpose" }),
];

export function StackDemo() {
  const form = useForm<StackCheckInput>({
    resolver: zodResolver(stackCheckSchema),
    defaultValues: { question: "" },
  });
  // TanStack Table returns non-memoizable functions by design.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data: stackItems,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      <Card>
        <CardHeader>
          <CardTitle>Form integration</CardTitle>
          <CardDescription>
            Submit a value to verify client-side Zod validation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(() => form.reset())}
          >
            <div className="space-y-2">
              <Label htmlFor="question">Test question</Label>
              <Input
                id="question"
                placeholder="When does enrollment open?"
                {...form.register("question")}
              />
              {form.formState.errors.question ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.question.message}
                </p>
              ) : null}
            </div>
            <Button type="submit">
              <CheckCircle2 data-icon="inline-start" />
              Validate
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Installed stack</CardTitle>
          <CardDescription>
            Rendered with a typed TanStack Table and shadcn/ui.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
