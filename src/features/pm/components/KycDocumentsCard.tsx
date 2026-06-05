import type { Document } from "@/types/pm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

interface KycDocumentsCardProps {
  kycDocs: { isLoading: boolean; data?: Document[] };
}

export default function KycDocumentsCard({ kycDocs }: KycDocumentsCardProps) {
  return (
    <>
      {kycDocs.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : kycDocs.data?.length ? (
        <div className="space-y-2">
          {kycDocs.data.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <div className="truncate font-medium">{d.title}</div>
                <div className="truncate text-xs text-muted-foreground">{d.document_type}</div>
              </div>
              <Button asChild variant="outline" size="sm">
                <a href={d.file_url} target="_blank" rel="noreferrer">
                  View
                </a>
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No KYC documents" />
      )}
    </>
  );
}
