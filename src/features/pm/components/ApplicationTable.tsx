import FormsTab, { buildPublicFormUrl } from "@/features/pm/components/FormsTab";
import InboxTab from "@/features/pm/components/InboxTab";
import type { RentalApplication, RentalApplicationForm, TenantStatus } from "@/types/pm";

interface ApplicationTableProps {
  tab: "forms" | "inbox";
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
  applicationsData?: RentalApplication[];
  applicationsIsLoading: boolean;
  applicationsIsError: boolean;
  applicationsRefetch: () => void;
  appsOffset: number;
  appsLimit: number;
  appsCanPrev: boolean;
  appsCanNext: boolean;
  onAppsPrev: () => void;
  onAppsNext: () => void;
  status: TenantStatus | "";
  onStatusChange: (status: TenantStatus | "") => void;
  appsLimitValue: number;
  onAppsLimitChange: (limit: number) => void;
  decideIsLoading: boolean;
  onApprove: (application: RentalApplication) => void;
  onReject: (application: RentalApplication) => void;
}

const ApplicationTable: React.FC<ApplicationTableProps> = ({
  tab,
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
  applicationsData,
  applicationsIsLoading,
  applicationsIsError,
  applicationsRefetch,
  appsOffset,
  appsLimit,
  appsCanPrev,
  appsCanNext,
  onAppsPrev,
  onAppsNext,
  status,
  onStatusChange,
  appsLimitValue,
  onAppsLimitChange,
  decideIsLoading,
  onApprove,
  onReject,
}) => {
  if (tab === "forms") {
    return (
      <FormsTab
        formsData={formsData}
        formsIsLoading={formsIsLoading}
        formsIsError={formsIsError}
        formsRefetch={formsRefetch}
        formsOffset={formsOffset}
        formsLimit={formsLimit}
        formsCanPrev={formsCanPrev}
        formsCanNext={formsCanNext}
        onFormsPrev={onFormsPrev}
        onFormsNext={onFormsNext}
        formsQ={formsQ}
        onFormsQChange={onFormsQChange}
        formsLimitValue={formsLimitValue}
        onFormsLimitChange={onFormsLimitChange}
        toast={toast}
      />
    );
  }

  return (
    <InboxTab
      applicationsData={applicationsData}
      applicationsIsLoading={applicationsIsLoading}
      applicationsIsError={applicationsIsError}
      applicationsRefetch={applicationsRefetch}
      appsOffset={appsOffset}
      appsLimit={appsLimit}
      appsCanPrev={appsCanPrev}
      appsCanNext={appsCanNext}
      onAppsPrev={onAppsPrev}
      onAppsNext={onAppsNext}
      status={status}
      onStatusChange={onStatusChange}
      appsLimitValue={appsLimitValue}
      onAppsLimitChange={onAppsLimitChange}
      decideIsLoading={decideIsLoading}
      onApprove={onApprove}
      onReject={onReject}
    />
  );
};

export { ApplicationTable, buildPublicFormUrl };
