import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, Copy, FileSearch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PAGE_SIZES } from "@/features/pm/constants";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RentalApplicationForm } from "@/types/pm";
import { API_BASE_URL } from "@/lib/config";

const buildPublicFormUrl = (slug: string) => {
  return `${API_BASE_URL}/pm/public/applications/${slug}`;
};

interface FormsTabProps {
  formsData?: RentalApplicationForm[];
  formsIsLoading: boolean;
  formsIsError: boolean;
  formsRefetch: () => void;
  formsOffset: number;
  formsLimit: number;
  formsCanPrev: boolean;
  formsCanNext: boolean;
  onFormsPrev: () => void;
  onFormsNext: () => void;
  formsQ: string;
  onFormsQChange: (q: string) => void;
  formsLimitValue: number;
  onFormsLimitChange: (limit: number) => void;
  toast: (props: { title: string; description: string; variant?: "default" | "destructive" | null }) => void;
}

export default function FormsTab({
  formsData,
  formsIsLoading,
  formsIsError,
  formsRefetch,
  formsOffset,
  formsLimit,
  formsCanPrev,
  formsCanNext,
  onFormsPrev,
  onFormsNext,
  formsQ,
  onFormsQChange,
  formsLimitValue,
  onFormsLimitChange,
  toast,
}: FormsTabProps) {
  const formColumns = useMemo<ColumnDef<RentalApplicationForm>[]>(() => {
    return [
      {
        accessorKey: "title",
        header: "Form",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate font-medium">{row.original.title}</div>
            <div className="truncate text-xs text-muted-foreground">
              Slug: {row.original.slug}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "property_id",
        header: "Property",
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.property_id ? `#${row.original.property_id}` : "Any"}
          </span>
        ),
      },
      {
        accessorKey: "is_active",
        header: "Active",
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? "default" : "outline"}>
            {row.original.is_active ? "yes" : "no"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to={`/pm/applications?tab=inbox&form_id=${row.original.id}`}>
                Inbox
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const url = buildPublicFormUrl(row.original.slug);
                navigator.clipboard.writeText(url).then(
                  () => toast({ title: "Copied", description: "Public form URL copied." }),
                  () => toast({ title: "Copy failed", description: "Could not copy to clipboard.", variant: "destructive" }),
                );
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy link
            </Button>
          </div>
        ),
      },
    ];
  }, [toast]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Application Forms</CardTitle>
        <Badge variant="secondary" className="h-fit">
          <FileSearch className="mr-1 h-3 w-3" />
          {formsData?.length ?? 0} shown
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            value={formsQ}
            onChange={(e) => onFormsQChange(e.target.value)}
            placeholder="Search title…"
          />
          <Select
            value={String(formsLimitValue)}
            onValueChange={(v) => onFormsLimitChange(Number(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Page size" />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formsIsLoading ? (
          <LoadingState type="spinner" />
        ) : formsIsError ? (
          <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to load forms.</span>
            <Button variant="outline" size="sm" onClick={() => { void formsRefetch(); }}>
              Retry
            </Button>
          </div>
        ) : formsData?.length ? (
          <>
            <DataTable columns={formColumns} data={formsData} />
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-muted-foreground">
                Offset {formsOffset} &bull; Limit {formsLimit}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={!formsCanPrev} onClick={onFormsPrev}>
                  Prev
                </Button>
                <Button variant="outline" size="sm" disabled={!formsCanNext} onClick={onFormsNext}>
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState title="No forms" description="Create an application form to start collecting submissions." />
        )}
      </CardContent>
    </Card>
  );
}

export { buildPublicFormUrl };
