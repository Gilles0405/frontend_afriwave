
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import {
  Mail,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Users,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RadioUserService,
  type RadioTeamMember,
} from "@/lib/RadioUserService-api";

type RadioRole = {
  id: number;
  name: string;
  description?: string | null;
};

type Props = {
  radioId: number;
  currentUserId?: number;
};

export default function RadioTeamManager({
  radioId,
  currentUserId,
}: Props) {
  const t = useTranslations("RadioTeam");

  const [members, setMembers] = useState<RadioTeamMember[]>([]);
  const [roles, setRoles] = useState<RadioRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleName, setInviteRoleName] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [selectedMember, setSelectedMember] =
    useState<RadioTeamMember | null>(null);
  const [selectedRoleName, setSelectedRoleName] = useState("");
  const [memberToRemove, setMemberToRemove] =
    useState<RadioTeamMember | null>(null);

  const loadRoles = useCallback(async () => {
    try {
      setRolesLoading(true);

      const result = await RadioUserService.getAssignableRoles();

      const assignableRoles = (
        Array.isArray(result) ? result : []
      ).filter((role) => role.name !== "SUPER_ADMIN");

      setRoles(assignableRoles);

      if (assignableRoles.length === 0) {
        console.warn(
          "Aucun rôle attribuable retourné par getAssignableRoles()."
        );
      }
    } catch (error) {
      console.error("Erreur de chargement des rôles :", error);
      setRoles([]);
      toast.error(
        error instanceof Error ? error.message : t("errors.loadRoles")
      );
    } finally {
      setRolesLoading(false);
    }
  }, [t]);

  const loadMembers = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const result = await RadioUserService.getMembers(radioId);
        setMembers(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Erreur de chargement des membres :", error);
        toast.error(
          error instanceof Error ? error.message : t("errors.load")
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [radioId, t]
  );

  useEffect(() => {
    void loadMembers();
    void loadRoles();
  }, [loadMembers, loadRoles]);

  const filteredMembers = members.filter((member) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    const fullName =
      `${member.user?.firstName ?? ""} ${member.user?.lastName ?? ""}`
        .trim()
        .toLowerCase();

    return (
      fullName.includes(query) ||
      (member.user?.email ?? "").toLowerCase().includes(query) ||
      (member.role?.name ?? "").toLowerCase().includes(query)
    );
  });

  const getRoleIdByName = (roleName: string): number | null => {
    const role = roles.find((item) => item.name === roleName);
    return role ? Number(role.id) : null;
  };

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const email = inviteEmail.trim();
    const roleId = getRoleIdByName(inviteRoleName);

    if (!email || roleId === null) {
      toast.error(t("errors.inviteFields"));
      return;
    }

    try {
      setSubmitting(true);

      await RadioUserService.inviteMember(radioId, email, roleId);

      toast.success(t("messages.invitationSent"));
      setInviteOpen(false);
      setInviteEmail("");
      setInviteRoleName("");

      await loadMembers(true);
    } catch (error) {
      console.error("Erreur d'invitation :", error);
      toast.error(
        error instanceof Error ? error.message : t("errors.invite")
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRoleUpdate() {
    if (!selectedMember) return;

    const roleId = getRoleIdByName(selectedRoleName);

    if (roleId === null) {
      toast.error(t("errors.inviteFields"));
      return;
    }

    if (roleId === Number(selectedMember.roleId)) {
      setSelectedMember(null);
      return;
    }

    try {
      setSubmitting(true);

      await RadioUserService.updateRole(
        radioId,
        selectedMember.userId,
        roleId
      );

      toast.success(t("messages.roleUpdated"));
      setSelectedMember(null);
      setSelectedRoleName("");

      await loadMembers(true);
    } catch (error) {
      console.error("Erreur de modification du rôle :", error);
      toast.error(
        error instanceof Error ? error.message : t("errors.updateRole")
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove() {
    if (!memberToRemove) return;

    try {
      setSubmitting(true);

      await RadioUserService.removeMember(
        radioId,
        memberToRemove.userId
      );

      toast.success(t("messages.memberRemoved"));
      setMemberToRemove(null);

      await loadMembers(true);
    } catch (error) {
      console.error("Erreur de suppression du membre :", error);
      toast.error(
        error instanceof Error ? error.message : t("errors.remove")
      );
    } finally {
      setSubmitting(false);
    }
  }

  const administratorsCount = members.filter(
    (member) => member.role?.name === "RADIO_ADMIN"
  ).length;

  const roleOptionsDisabled = rolesLoading || roles.length === 0;

  return (
    <div className="space-y-6">
      {/* En-tête et actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void loadMembers(true);
              void loadRoles();
            }}
            disabled={loading || refreshing || rolesLoading}
          >
            <RefreshCw
              className={`mr-2 size-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            {t("actions.refresh")}
          </Button>

          <Button
            type="button"
            onClick={() => setInviteOpen(true)}
            disabled={rolesLoading}
          >
            <UserPlus className="mr-2 size-4" />
            {t("actions.invite")}
          </Button>

          {/* Modale d'invitation contrôlée par inviteOpen */}
          <Dialog
            open={inviteOpen}
            onOpenChange={(open) => {
              if (submitting) return;

              setInviteOpen(open);

              if (!open) {
                setInviteEmail("");
                setInviteRoleName("");
              }
            }}
          >
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <form onSubmit={handleInvite} className="space-y-5">
                <DialogHeader>
                  <DialogTitle>{t("invite.title")}</DialogTitle>
                  <DialogDescription>
                    {t("invite.description")}
                  </DialogDescription>
                </DialogHeader>

                {/* Adresse e-mail */}
                <div className="space-y-2">
                  <Label htmlFor="member-email">
                    {t("invite.email")}
                  </Label>

                  <Input
                    id="member-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="collaborateur@exemple.com"
                    value={inviteEmail}
                    onChange={(event) =>
                      setInviteEmail(event.target.value)
                    }
                    required
                    maxLength={150}
                    disabled={submitting}
                  />
                </div>

                {/* Rôle à attribuer */}
                <div className="space-y-2">
                  <Label htmlFor="invite-role">
                    {t("invite.role")}
                  </Label>

                  <Select
                    value={inviteRoleName}
                    onValueChange={(value) => setInviteRoleName(value ?? "")}
                    disabled={roleOptionsDisabled || submitting}
                  >
                    <SelectTrigger id="invite-role" className="w-full">
                      <SelectValue
                        placeholder={
                          rolesLoading
                            ? t("states.loadingRoles")
                            : roles.length === 0
                              ? t("states.noRoles")
                              : t("invite.chooseRole")
                        }
                      />
                    </SelectTrigger>

                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem
                          key={role.id}
                          value={role.name}
                        >
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {roles.length === 0 && !rolesLoading && (
                    <p className="text-sm text-muted-foreground">
                      {t("states.noRolesDescription")}
                    </p>
                  )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={submitting}
                    onClick={() => setInviteOpen(false)}
                  >
                    {t("actions.cancel")}
                  </Button>

                  <Button
                    type="submit"
                    disabled={
                      submitting ||
                      rolesLoading ||
                      roles.length === 0 ||
                      !inviteEmail.trim() ||
                      !inviteRoleName
                    }
                  >
                    <Mail className="mr-2 size-4" />
                    {submitting
                      ? t("actions.sending")
                      : t("actions.sendInvitation")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.members")}
            </CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.administrators")}
            </CardTitle>
            <ShieldCheck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {administratorsCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des membres */}
      <Card>
        <CardHeader>
          <CardTitle>{t("list.title")}</CardTitle>
          <CardDescription>{t("list.description")}</CardDescription>

          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("list.search")}
            aria-label={t("list.search")}
            className="max-w-sm"
          />
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("states.loading")}
            </p>
          ) : filteredMembers.length === 0 ? (
            <div className="py-10 text-center">
              <Users className="mx-auto mb-3 size-10 text-muted-foreground" />
              <p className="font-medium">{t("states.empty")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("states.emptyDescription")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("table.member")}</TableHead>
                    <TableHead>{t("table.role")}</TableHead>
                    <TableHead>{t("table.status")}</TableHead>
                    <TableHead className="text-right">
                      {t("table.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredMembers.map((member) => {
                    const fullName =
                      `${member.user?.firstName ?? ""} ${
                        member.user?.lastName ?? ""
                      }`.trim();

                    return (
                      <TableRow
                        key={`${member.radioId}-${member.userId}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={member.user?.avatar ?? undefined}
                                alt={fullName}
                              />
                              <AvatarFallback>
                                {fullName.slice(0, 2).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {fullName || member.user?.email}
                                {member.userId === currentUserId && (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    {t("table.you")}
                                  </span>
                                )}
                              </p>
                              <p className="truncate text-sm text-muted-foreground">
                                {member.user?.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="secondary">
                            {member.role?.name ?? t("table.unknownRole")}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              member.user?.isActive ? "default" : "outline"
                            }
                          >
                            {member.user?.isActive
                              ? t("status.active")
                              : t("status.inactive")}
                          </Badge>

                          {!member.user?.emailVerified && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {t("status.emailUnverified")}
                            </p>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          {member.role?.name === "SUPER_ADMIN" ? (
                            <span className="text-xs text-muted-foreground">
                              {t("table.protected")}
                            </span>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedMember(member);
                                  setSelectedRoleName(
                                    member.role?.name ?? ""
                                  );
                                }}
                                aria-label={t("actions.changeRole")}
                              >
                                {t("actions.changeRole")}
                              </Button>

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setMemberToRemove(member)
                                }
                                aria-label={t("actions.remove")}
                                disabled={
                                  submitting ||
                                  member.userId === currentUserId
                                }
                              >
                                <Trash2 className="size-4 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modification du rôle */}
      <Dialog
        open={Boolean(selectedMember)}
        onOpenChange={(open) => {
          if (!open && !submitting) {
            setSelectedMember(null);
            setSelectedRoleName("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("roleDialog.title")}</DialogTitle>
            <DialogDescription>
              {selectedMember?.user?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="edit-role">{t("invite.role")}</Label>

            <Select
              value={selectedRoleName}
              onValueChange={(value) => setSelectedRoleName(value ?? "")}
              disabled={roleOptionsDisabled || submitting}
            >
              <SelectTrigger id="edit-role">
                <SelectValue
                  placeholder={
                    rolesLoading
                      ? t("states.loadingRoles")
                      : t("invite.chooseRole")
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={() => void handleRoleUpdate()}
              disabled={
                submitting ||
                rolesLoading ||
                !selectedRoleName ||
                selectedRoleName === selectedMember?.role?.name
              }
            >
              {t("actions.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation de suppression */}
      <AlertDialog
        open={Boolean(memberToRemove)}
        onOpenChange={(open) => {
          if (!open && !submitting) setMemberToRemove(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("removeDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("removeDialog.description", {
                email: memberToRemove?.user?.email ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>
              {t("actions.cancel")}
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleRemove();
              }}
              disabled={submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("actions.remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
