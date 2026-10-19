
"use client";

import { useCallback, useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Radio,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  RadioRequest,
  RadioRequestStatus,
} from "@/lib/radioRequestApi";
import { radioRequestApi } from "@/lib/radio-request-api";

type Props = {
  id: string;
};

function getStatusClass(status: RadioRequestStatus) {
  switch (status) {
    case "APPROVED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300";
    case "REJECTED":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300";
  }
}

function normalizeStatus(status?: string): RadioRequestStatus {
  if (status === "APPROVED" || status === "REJECTED") {
    return status;
  }

  return "PENDING";
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="break-words text-sm font-medium">
        {value?.trim() || "—"}
      </p>
    </div>
  );
}

function ExternalField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (!value?.trim()) return null;

  let href = value.trim();

  if (!/^https?:\/\//i.test(href)) {
    href = `https://${href}`;
  }

  try {
    const parsed = new URL(href);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return <DetailField label={label} value={value} />;
    }
  } catch {
    return <DetailField label={label} value={value} />;
  }

  return (
    <div className="min-w-0 space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex max-w-full items-center gap-2 break-all text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        <span>{value}</span>
        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
      </a>
    </div>
  );
}

export default function RadioRequestDetail({ id }: Props) {
  const t = useTranslations("RadioRequestDetail");
  const router = useRouter();

  const [request, setRequest] = useState<RadioRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [rejectionReason, setRejectionReason] = useState("");
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const loadRequest = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await radioRequestApi.getById(id);

      if (
        !result.success ||
        !result.data ||
        typeof result.data !== "object"
      ) {
        throw new Error("Invalid radio request response");
      }

      setRequest(result.data as RadioRequest);
    } catch (err) {
      console.error("Unable to load radio request:", err);
      setError(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void loadRequest();
  }, [loadRequest]);

  const status = normalizeStatus(request?.status);
  const isPending = !!request && status === "PENDING";

  function formatDate(value?: string | null) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "long",
      timeStyle: "short",
    }).format(date);
  }

  async function handleApprove() {
    if (!request || !isPending || actionLoading) return;

    setActionLoading(true);
    setActionError("");

    try {
      const result = await radioRequestApi.approve(request.id);

      if (!result.success) {
        throw new Error(result.message || t("approveError"));
      }

      if (result.data && typeof result.data === "object") {
        setRequest(result.data as RadioRequest);
      } else {
        setRequest((current) =>
          current ? { ...current, status: "APPROVED" } : current,
        );
      }

      setApproveDialogOpen(false);
    } catch (err) {
      console.error("Unable to approve radio request:", err);

      setActionError(
        err instanceof Error && err.message
          ? err.message
          : t("approveError"),
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!request || !isPending || actionLoading) return;

    const reason = rejectionReason.trim();

    if (!reason) {
      setActionError(t("reasonRequired"));
      return;
    }

    setActionLoading(true);
    setActionError("");

    try {
      const result = await radioRequestApi.reject(request.id, reason);

      if (!result.success) {
        throw new Error(result.message || t("rejectError"));
      }

      if (result.data && typeof result.data === "object") {
        setRequest(result.data as RadioRequest);
      } else {
        setRequest((current) =>
          current
            ? {
                ...current,
                status: "REJECTED",
                rejectionReason: reason,
              }
            : current,
        );
      }

      setRejectDialogOpen(false);
      setRejectionReason("");
      setActionError("");
    } catch (err) {
      console.error("Unable to reject radio request:", err);

      setActionError(
        err instanceof Error && err.message
          ? err.message
          : t("rejectError"),
      );
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/radio-requests")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("back")}
        </Button>

        <Alert variant="destructive">
          <AlertDescription>
            {error || t("notFound")}
          </AlertDescription>
        </Alert>

        <Button onClick={() => void loadRequest()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          {t("retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <Button
          variant="ghost"
          className="-ml-3 mb-4"
          onClick={() => router.push("/admin/radio-requests")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("back")}
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
              <Radio className="h-6 w-6" />
            </div>

            <div className="min-w-0 space-y-1">
              <h1 className="break-words text-2xl font-semibold tracking-tight">
                {request.name}
              </h1>

              <p className="text-sm text-muted-foreground">
                {t("requestId", { id: String(request.id) })}
              </p>

              <Badge variant="outline" className={getStatusClass(status)}>
                {t(`status.${status}`)}
              </Badge>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => void loadRequest()}
            disabled={loading || actionLoading}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("refresh")}
          </Button>
        </div>
      </div>

      {actionError && (
        <Alert variant="destructive">
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      {status === "APPROVED" && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{t("approvedNotice")}</AlertDescription>
        </Alert>
      )}

      {status === "REJECTED" && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            {t("rejectedNotice")}

            {(request.rejectionReason || request.rejection_reason) && (
              <p className="mt-2">
                <strong>{t("rejectionReason")}:</strong>{" "}
                {request.rejectionReason || request.rejection_reason}
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("radioInformation")}</CardTitle>
              <CardDescription>
                {t("radioInformationDescription")}
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-5 sm:grid-cols-2">
              <DetailField label={t("fields.name")} value={request.name} />

              <DetailField
                label={t("fields.frequency")}
                value={request.frequency}
              />

              <DetailField label={t("fields.city")} value={request.city} />

              <DetailField
                label={t("fields.country")}
                value={request.country}
              />

              <div className="sm:col-span-2">
                <DetailField
                  label={t("fields.address")}
                  value={request.address}
                />
              </div>

              <div className="sm:col-span-2">
                <DetailField
                  label={t("fields.description")}
                  value={request.description}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("contactInformation")}</CardTitle>
              <CardDescription>
                {t("contactInformationDescription")}
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-5 sm:grid-cols-2">
              <DetailField label={t("fields.email")} value={request.email} />
              <DetailField label={t("fields.phone")} value={request.phone} />

              <div className="sm:col-span-2">
                <ExternalField
                  label={t("fields.website")}
                  value={request.website}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("onlinePresence")}</CardTitle>
              <CardDescription>
                {t("onlinePresenceDescription")}
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-5 sm:grid-cols-2">
              <ExternalField
                label={t("fields.streamUrl")}
                value={request.streamUrl}
              />

              <ExternalField
                label={t("fields.facebook")}
                value={request.facebook}
              />

              <ExternalField
                label={t("fields.instagram")}
                value={request.instagram}
              />

              <ExternalField
                label={t("fields.youtube")}
                value={request.youtube}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("requestSummary")}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("fields.status")}
                </p>

                <Badge variant="outline" className={getStatusClass(status)}>
                  {t(`status.${status}`)}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("fields.createdAt")}
                </p>

                <p className="text-sm font-medium">
                  {formatDate(request.createdAt ?? request.created_at)}
                </p>
              </div>

              {request.updatedAt && (
                <>
                  <Separator />

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {t("fields.updatedAt")}
                    </p>

                    <p className="text-sm font-medium">
                      {formatDate(request.updatedAt)}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {isPending && (
            <Card>
              <CardHeader>
                <CardTitle>{t("adminActions")}</CardTitle>
                <CardDescription>
                  {t("adminActionsDescription")}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Approbation : dialogue contrôlé sans AlertDialogTrigger */}
                <AlertDialog
                  open={approveDialogOpen}
                  onOpenChange={(open) => {
                    if (actionLoading) return;

                    setApproveDialogOpen(open);

                    if (!open) {
                      setActionError("");
                    }
                  }}
                >
                  <Button
                    className="w-full"
                    disabled={actionLoading}
                    onClick={() => {
                      setActionError("");
                      setApproveDialogOpen(true);
                    }}
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    {t("approve")}
                  </Button>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t("approveConfirmationTitle")}
                      </AlertDialogTitle>

                      <AlertDialogDescription>
                        {t("approveConfirmationDescription", {
                          name: request.name,
                        })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    {actionError && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {actionError}
                        </AlertDescription>
                      </Alert>
                    )}

                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={actionLoading}>
                        {t("cancel")}
                      </AlertDialogCancel>

                      <Button
                        disabled={actionLoading}
                        onClick={() => void handleApprove()}
                      >
                        {actionLoading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}

                        {t("confirmApprove")}
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Rejet : dialogue contrôlé sans AlertDialogTrigger */}
                <AlertDialog
                  open={rejectDialogOpen}
                  onOpenChange={(open) => {
                    if (actionLoading) return;

                    setRejectDialogOpen(open);

                    if (!open) {
                      setActionError("");
                      setRejectionReason("");
                    }
                  }}
                >
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={actionLoading}
                    onClick={() => {
                      setActionError("");
                      setRejectDialogOpen(true);
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    {t("reject")}
                  </Button>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t("rejectConfirmationTitle")}
                      </AlertDialogTitle>

                      <AlertDialogDescription>
                        {t("rejectConfirmationDescription", {
                          name: request.name,
                        })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-2">
                      <label
                        htmlFor="rejection-reason"
                        className="text-sm font-medium"
                      >
                        {t("rejectionReason")}
                      </label>

                      <Textarea
                        id="rejection-reason"
                        value={rejectionReason}
                        onChange={(event) =>
                          setRejectionReason(event.target.value)
                        }
                        placeholder={t("rejectionReasonPlaceholder")}
                        rows={4}
                        maxLength={1000}
                        required
                        disabled={actionLoading}
                      />

                      <p className="text-right text-xs text-muted-foreground">
                        {rejectionReason.length}/1000
                      </p>
                    </div>

                    {actionError && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {actionError}
                        </AlertDescription>
                      </Alert>
                    )}

                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={actionLoading}>
                        {t("cancel")}
                      </AlertDialogCancel>

                      <Button
                        variant="destructive"
                        disabled={
                          actionLoading || !rejectionReason.trim()
                        }
                        onClick={() => void handleReject()}
                      >
                        {actionLoading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}

                        {t("confirmReject")}
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
