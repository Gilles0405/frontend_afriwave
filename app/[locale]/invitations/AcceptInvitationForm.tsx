

"use client";



import { useCallback, useEffect, useState, type FormEvent } from "react";

import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";

import {

  AlertCircle,

  ArrowLeft,

  ArrowRight,

  CheckCircle2,

  LoaderCircle,

  Mail,

  Radio as RadioIcon,

  ShieldCheck,

  Users,

} from "lucide-react";

import { toast } from "sonner";



import {

  Alert,

  AlertDescription,

  AlertTitle,

} from "@/components/ui/alert";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import {

  Card,

  CardContent,

  CardDescription,

  CardFooter,

  CardHeader,

  CardTitle,

} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Separator } from "@/components/ui/separator";



type Invitation = {

  id: number;

  email: string;

  expiresAt: string;

  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED";

  radio: {

    id: number;

    name: string;

    slug: string;

    logo?: string | null;

    city?: string | null;

    country?: string | null;

  };

  role: {

    id: number;

    name: string;

    description?: string | null;

  };

};



type AcceptedInvitation = {

  user: {

    id: number;

    firstName: string;

    lastName: string;

    email: string;

  };

  radio: {

    id: number;

    name: string;

    slug: string;

  };

  role: {

    id: number;

    name: string;

  };

};



type ApiResponse<T> = {

  success?: boolean;

  message?: string;

  code?: string;

  data?: T;

};



type Props = {

  locale: string;

  token: string;

};



const ERROR_KEYS: Record<string, string> = {

  INVITATION_NOT_FOUND: "errors.INVITATION_NOT_FOUND",

  INVITATION_EXPIRED: "errors.INVITATION_EXPIRED",

  INVITATION_ALREADY_PROCESSED: "errors.INVITATION_ALREADY_PROCESSED",

  INVITATION_EMAIL_MISMATCH: "errors.INVITATION_EMAIL_MISMATCH",

  USER_ALREADY_MEMBER: "errors.USER_ALREADY_MEMBER",

  EXISTING_ACCOUNT_LOGIN_REQUIRED: "errors.EXISTING_ACCOUNT_LOGIN_REQUIRED",

  AUTHENTICATION_REQUIRED: "errors.AUTHENTICATION_REQUIRED",

};



export default function AcceptInvitationForm({ locale, token }: Props) {

  const t = useTranslations("AcceptInvitation");

  const router = useRouter();



  const [invitation, setInvitation] = useState<Invitation | null>(null);

  const [accepted, setAccepted] = useState<AcceptedInvitation | null>(null);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [existingAccountLoading, setExistingAccountLoading] = useState(false);

  const [error, setError] = useState("");

  const [showRegistration, setShowRegistration] = useState(true);



  const [firstName, setFirstName] = useState("");

  const [lastName, setLastName] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");



  const getErrorMessage = useCallback(

    (code?: string, message?: string) => {

      if (code && ERROR_KEYS[code]) {

        return t(ERROR_KEYS[code] as never);

      }



      return message || t("errors.generic");

    },

    [t],

  );



  const goToLogin = useCallback(() => {

    const returnTo =

      `/${locale}/invitations/accept?token=${encodeURIComponent(token)}`;



    router.push(`/login?redirect=${encodeURIComponent(returnTo)}`);

  }, [locale, token, router]);



  useEffect(() => {

    let cancelled = false;

    const controller = new AbortController();



    async function loadInvitation() {

      if (!token.trim()) {

        setError(t("errors.missingToken"));

        setLoading(false);

        return;

      }



      setLoading(true);

      setError("");



      try {

        const response = await fetch(

          `/api/radio-invitations/${encodeURIComponent(token)}`,

          {

            method: "GET",

            headers: { Accept: "application/json" },

            cache: "no-store",

            signal: controller.signal,

          },

        );



        const result: ApiResponse<Invitation> = await response.json();



        if (!response.ok || !result.success || !result.data) {

          throw new Error(getErrorMessage(result.code, result.message));

        }



        if (!cancelled) {

          setInvitation(result.data);

        }

      } catch (err) {

        if (!cancelled && !controller.signal.aborted) {

          setError(

            err instanceof Error ? err.message : t("errors.network"),

          );

        }

      } finally {

        if (!cancelled) {

          setLoading(false);

        }

      }

    }



    void loadInvitation();



    return () => {

      cancelled = true;

      controller.abort();

    };

  }, [token, t, getErrorMessage]);



  async function handleSubmit(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();



    if (!invitation || submitting || existingAccountLoading) return;



    if (password.length < 8) {

      setError(t("errors.passwordLength"));

      return;

    }



    if (password !== confirmPassword) {

      setError(t("errors.passwordMismatch"));

      return;

    }



    setSubmitting(true);

    setError("");



    try {

      const response = await fetch("/api/radio-invitations/accept", {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

          Accept: "application/json",

        },

        body: JSON.stringify({

          token,

          firstName: firstName.trim(),

          lastName: lastName.trim(),

          password,

        }),

      });



      const result: ApiResponse<AcceptedInvitation> = await response.json();



      if (!response.ok || !result.success || !result.data) {

        if (result.code === "EXISTING_ACCOUNT_LOGIN_REQUIRED") {

          toast.error(t("errors.EXISTING_ACCOUNT_LOGIN_REQUIRED"));

          goToLogin();

          return;

        }



        throw new Error(getErrorMessage(result.code, result.message));

      }



      setAccepted(result.data);

      setPassword("");

      setConfirmPassword("");

      toast.success(t("success.title"));

    } catch (err) {

      setError(

        err instanceof Error ? err.message : t("errors.network"),

      );

    } finally {

      setSubmitting(false);

    }

  }



  async function handleExistingAccount() {

    if (!invitation || existingAccountLoading || submitting) return;



    setExistingAccountLoading(true);

    setError("");



    try {

      const response = await fetch(

        "/api/radio-invitations/accept-existing",

        {

          method: "POST",

          headers: {

            "Content-Type": "application/json",

            Accept: "application/json",

          },

          body: JSON.stringify({ token }),

        },

      );



      const result: ApiResponse<AcceptedInvitation> = await response.json();



      if (!response.ok || !result.success || !result.data) {

        if (

          response.status === 401 ||

          result.code === "AUTHENTICATION_REQUIRED"

        ) {

          goToLogin();

          return;

        }



        throw new Error(getErrorMessage(result.code, result.message));

      }



      setAccepted(result.data);

      toast.success(t("success.title"));

    } catch (err) {

      setError(

        err instanceof Error ? err.message : t("errors.network"),

      );

    } finally {

      setExistingAccountLoading(false);

    }

  }



  const goToHome = () => router.push("/");



  if (loading) {

    return (

      <Card className="overflow-hidden border-border/70 shadow-lg">

        <div className="h-1.5 bg-gradient-to-r from-[#F56600] via-[#FF8A3D] to-[#F56600]" />

        <CardContent className="flex min-h-72 flex-col items-center justify-center gap-4 p-8 text-center">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F56600]/10">

            <LoaderCircle className="h-7 w-7 animate-spin text-[#F56600]" />

          </div>

          <p className="text-sm text-muted-foreground">{t("loading")}</p>

        </CardContent>

      </Card>

    );

  }



  if (accepted) {

    return (

      <Card className="overflow-hidden border-border/70 shadow-lg">

        <div className="h-1.5 bg-gradient-to-r from-[#F56600] via-[#FF8A3D] to-[#F56600]" />

        <CardHeader className="items-center space-y-4 px-6 pb-2 pt-10 text-center sm:px-10">

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F56600]/10 text-[#F56600]">

            <CheckCircle2 className="h-9 w-9" />

          </div>

          <Badge className="border-0 bg-[#F56600]/10 text-[#F56600] hover:bg-[#F56600]/15">

            {t("success.badge")}

          </Badge>

          <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl">

            {t("success.title")}

          </CardTitle>

          <CardDescription className="max-w-md text-sm leading-6 sm:text-base">

            {t("success.description", {

              radio: accepted.radio.name,

              role: accepted.role.name,

            })}

          </CardDescription>

        </CardHeader>



        <CardContent className="space-y-5 px-6 pb-8 pt-6 sm:px-10">

          <div className="rounded-xl border bg-muted/30 p-4">

            <p className="font-semibold">{accepted.radio.name}</p>

            <p className="mt-1 text-sm text-muted-foreground">

              {accepted.user.email}

            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">

              <Badge variant="outline">{accepted.role.name}</Badge>

            </div>

          </div>



          <Button

            className="w-full bg-[#F56600] text-white hover:bg-[#D95500]"

            onClick={goToLogin}

          >

            {t("success.login")}

            <ArrowRight className="ml-2 h-4 w-4" />

          </Button>

        </CardContent>

      </Card>

    );

  }



  if (error && !invitation) {

    return (

      <Card className="overflow-hidden border-border/70 shadow-lg">

        <div className="h-1.5 bg-gradient-to-r from-[#F56600] via-[#FF8A3D] to-[#F56600]" />

        <CardHeader className="items-center px-6 pb-2 pt-10 text-center sm:px-10">

          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">

            <AlertCircle className="h-7 w-7" />

          </div>

          <CardTitle className="text-xl sm:text-2xl">

            {t("errors.invalidTitle")}

          </CardTitle>

          <CardDescription className="leading-6">

            {error}

          </CardDescription>

        </CardHeader>

        <CardFooter className="flex-col gap-3 px-6 pb-8 pt-5 sm:px-10">

          <Button className="w-full" onClick={goToLogin}>

            {t("success.login")}

            <ArrowRight className="ml-2 h-4 w-4" />

          </Button>

          <Button

            type="button"

            variant="ghost"

            className="w-full"

            onClick={goToHome}

          >

            <ArrowLeft className="mr-2 h-4 w-4" />

            {t("actions.backHome")}

          </Button>

        </CardFooter>

      </Card>

    );

  }



  if (!invitation) return null;



  return (

    <Card className="overflow-hidden border-border/70 shadow-lg shadow-black/5">

      <div className="h-1.5 bg-gradient-to-r from-[#F56600] via-[#FF8A3D] to-[#F56600]" />



      <CardHeader className="space-y-4 pb-6 pt-6 sm:px-8 sm:pt-8">

        <div className="flex items-center justify-between gap-3">

          <Badge className="gap-1.5 border-0 bg-[#F56600]/10 text-[#F56600] hover:bg-[#F56600]/15">

            <Users className="h-3.5 w-3.5" />

            {t("badge")}

          </Badge>

          <ShieldCheck className="h-5 w-5 text-muted-foreground" />

        </div>



        <div className="space-y-2">

          <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl">

            {t("title")}

          </CardTitle>

          <CardDescription className="text-sm leading-6 sm:text-base">

            {t("description")}

          </CardDescription>

        </div>

      </CardHeader>



      <CardContent className="space-y-6 sm:px-8">

        <section

          aria-label={t("radio")}

          className="rounded-xl border bg-muted/30 p-4 sm:p-5"

        >

          <div className="flex items-start gap-3">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-background">

              {invitation.radio.logo ? (

                // eslint-disable-next-line @next/next/no-img-element

                <img

                  src={invitation.radio.logo}

                  alt={invitation.radio.name}

                  className="h-full w-full object-cover"

                />

              ) : (

                <RadioIcon className="h-6 w-6 text-[#F56600]" />

              )}

            </div>



            <div className="min-w-0 flex-1">

              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">

                {t("radio")}

              </p>

              <h2 className="mt-1 break-words font-semibold">

                {invitation.radio.name}

              </h2>

              {(invitation.radio.city || invitation.radio.country) && (

                <p className="mt-1 text-sm text-muted-foreground">

                  {[invitation.radio.city, invitation.radio.country]

                    .filter(Boolean)

                    .join(", ")}

                </p>

              )}

            </div>

          </div>



          <Separator className="my-4" />



          <div className="grid gap-4 sm:grid-cols-2">

            <div className="min-w-0">

              <p className="text-xs text-muted-foreground">{t("role")}</p>

              <p className="mt-1 break-words text-sm font-medium">

                {invitation.role.name}

              </p>

              {invitation.role.description && (

                <p className="mt-1 text-xs leading-5 text-muted-foreground">

                  {invitation.role.description}

                </p>

              )}

            </div>



            <div className="min-w-0">

              <p className="text-xs text-muted-foreground">{t("email")}</p>

              <p className="mt-1 flex items-start gap-2 break-all text-sm font-medium">

                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                {invitation.email}

              </p>

            </div>

          </div>

        </section>



        {error && (

          <Alert variant="destructive">

            <AlertCircle className="h-4 w-4" />

            <AlertTitle>{t("errors.title")}</AlertTitle>

            <AlertDescription>{error}</AlertDescription>

          </Alert>

        )}



        <div className="grid grid-cols-2 gap-1 rounded-xl border bg-muted/30 p-1">

          <Button

            type="button"

            variant={showRegistration ? "default" : "ghost"}

            className={

              showRegistration

                ? "min-h-10 bg-[#F56600] text-white hover:bg-[#D95500]"

                : "min-h-10"

            }

            onClick={() => {

              setShowRegistration(true);

              setError("");

            }}

          >

            {t("actions.createAccount")}

          </Button>

          <Button

            type="button"

            variant={!showRegistration ? "default" : "ghost"}

            className={

              !showRegistration

                ? "min-h-10 bg-[#F56600] text-white hover:bg-[#D95500]"

                : "min-h-10"

            }

            onClick={() => {

              setShowRegistration(false);

              setError("");

            }}

          >

            {t("actions.acceptWithAccount")}

          </Button>

        </div>



        {showRegistration ? (

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid gap-4 sm:grid-cols-2">

              <div className="space-y-2">

                <Label htmlFor="firstName">{t("fields.firstName")}</Label>

                <Input

                  id="firstName"

                  autoComplete="given-name"

                  value={firstName}

                  onChange={(event) => setFirstName(event.target.value)}

                  required

                  maxLength={80}

                  placeholder={t("fields.firstName")}

                />

              </div>



              <div className="space-y-2">

                <Label htmlFor="lastName">{t("fields.lastName")}</Label>

                <Input

                  id="lastName"

                  autoComplete="family-name"

                  value={lastName}

                  onChange={(event) => setLastName(event.target.value)}

                  required

                  maxLength={80}

                  placeholder={t("fields.lastName")}

                />

              </div>

            </div>



            <div className="space-y-2">

              <Label htmlFor="invitationEmail">{t("email")}</Label>

              <Input

                id="invitationEmail"

                type="email"

                value={invitation.email}

                readOnly

                aria-readonly="true"

                className="bg-muted"

              />

              <p className="text-xs leading-5 text-muted-foreground">

                {t("emailNotice")}

              </p>

            </div>



            <div className="space-y-2">

              <Label htmlFor="password">{t("fields.password")}</Label>

              <Input

                id="password"

                type="password"

                autoComplete="new-password"

                value={password}

                onChange={(event) => setPassword(event.target.value)}

                required

                minLength={8}

                maxLength={128}

              />

              <p className="text-xs text-muted-foreground">

                {t("fields.passwordHint")}

              </p>

            </div>



            <div className="space-y-2">

              <Label htmlFor="confirmPassword">

                {t("fields.confirmPassword")}

              </Label>

              <Input

                id="confirmPassword"

                type="password"

                autoComplete="new-password"

                value={confirmPassword}

                onChange={(event) => setConfirmPassword(event.target.value)}

                required

                minLength={8}

                maxLength={128}

              />

            </div>



            <Button

              type="submit"

              className="min-h-11 w-full bg-[#F56600] text-white hover:bg-[#D95500]"

              disabled={submitting || existingAccountLoading}

            >

              {submitting ? (

                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />

              ) : (

                <CheckCircle2 className="mr-2 h-4 w-4" />

              )}

              {submitting ? t("loading") : t("actions.createAccount")}

            </Button>

          </form>

        ) : (

          <div className="space-y-4">

            <Alert>

              <ShieldCheck className="h-4 w-4" />

              <AlertTitle>{t("existingAccount.title")}</AlertTitle>

              <AlertDescription>

                {t("existingAccount.description")}

              </AlertDescription>

            </Alert>



            <Button

              type="button"

              variant="outline"

              className="min-h-11 w-full"

              onClick={handleExistingAccount}

              disabled={existingAccountLoading || submitting}

            >

              {existingAccountLoading ? (

                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />

              ) : (

                <ArrowRight className="mr-2 h-4 w-4" />

              )}

              {existingAccountLoading

                ? t("loading")

                : t("actions.acceptWithAccount")}

            </Button>



            <p className="text-center text-xs leading-5 text-muted-foreground">

              {t("existingAccount.loginNotice")}

            </p>

          </div>

        )}



        <div className="flex items-start gap-2 rounded-lg border border-[#F56600]/10 bg-[#F56600]/5 p-3 text-xs leading-5 text-muted-foreground">

          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#F56600]" />

          <p>{t("securityNotice")}</p>

        </div>

      </CardContent>



      <CardFooter className="border-t bg-muted/20 px-6 py-4 sm:px-8">

        <p className="text-xs leading-5 text-muted-foreground">

          {t("footer")}

        </p>

      </CardFooter>

    </Card>

  );

}
