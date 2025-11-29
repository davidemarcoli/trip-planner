"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShareIcon, TrashIcon, UserPlusIcon, GlobeIcon, LockIcon } from "lucide-react";
import { Trip } from "@/lib/types";
import { inviteUser, removeUser, updateRole, getTripPermissions, togglePublic, TripPermission } from "@/lib/services/permissionService";
import { useAuth } from "@/lib/hooks/useAuth";

interface ShareTripDialogProps {
    trip: Trip;
    onUpdate: () => void;
}

export function ShareTripDialog({ trip, onUpdate }: ShareTripDialogProps) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<'view' | 'edit'>("view");
    const [collaborators, setCollaborators] = useState<TripPermission[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchPermissions = async () => {
        try {
            const perms = await getTripPermissions(trip.id);
            setCollaborators(perms);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (open) {
            fetchPermissions();
        }
    }, [open, trip.id]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await inviteUser(trip.id, email, role);
            setEmail("");
            await fetchPermissions();
        } catch (err: any) {
            setError(err.message || "Failed to invite user");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (userId: string) => {
        try {
            await removeUser(trip.id, userId);
            await fetchPermissions();
        } catch (err) {
            console.error(err);
        }
    };

    const handleRoleChange = async (userId: string, newRole: 'view' | 'edit') => {
        try {
            await updateRole(trip.id, userId, newRole);
            await fetchPermissions();
        } catch (err) {
            console.error(err);
        }
    };

    const handlePublicToggle = async (checked: boolean) => {
        try {
            await togglePublic(trip.id, checked);
            onUpdate(); // Refresh trip details to update isPublic
        } catch (err) {
            console.error(err);
        }
    };

    const isOwner = trip.ownerId === user?.uid;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <ShareIcon className="h-4 w-4" />
                    Share
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Share Trip</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="invite" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="invite">Invite</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="invite" className="space-y-6">
                        {isOwner && (
                            <form onSubmit={handleInvite} className="space-y-4">
                                <div className="flex gap-2 items-end">
                                    <div className="grid gap-2 flex-1">
                                        <Label htmlFor="email">Email address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="friend@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2 w-[100px]">
                                        <Label htmlFor="role">Role</Label>
                                        <Select value={role} onValueChange={(v: 'view' | 'edit') => setRole(v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="view">View</SelectItem>
                                                <SelectItem value="edit">Edit</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button type="submit" disabled={loading}>
                                        <UserPlusIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                                {error && <p className="text-sm text-red-500">{error}</p>}
                            </form>
                        )}

                        <div className="space-y-4">
                            <h4 className="text-sm font-medium">Collaborators</h4>
                            {collaborators.length === 0 ? (
                                <p className="text-sm text-gray-500">No collaborators yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {collaborators.map((collab) => (
                                        <div key={collab.userId} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={collab.photoURL} />
                                                    <AvatarFallback>{collab.displayName?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium">{collab.displayName}</p>
                                                    <p className="text-xs text-gray-500">{collab.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isOwner ? (
                                                    <>
                                                        <Select
                                                            value={collab.role}
                                                            onValueChange={(v: 'view' | 'edit') => handleRoleChange(collab.userId, v)}
                                                        >
                                                            <SelectTrigger className="h-8 w-[80px]">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="view">View</SelectItem>
                                                                <SelectItem value="edit">Edit</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500 hover:text-red-600"
                                                            onClick={() => handleRemove(collab.userId)}
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <span className="text-sm text-gray-500 capitalize">{collab.role}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6">
                        <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg">
                            <div className="flex items-center space-x-4">
                                {trip.isPublic ? (
                                    <GlobeIcon className="h-5 w-5 text-green-500" />
                                ) : (
                                    <LockIcon className="h-5 w-5 text-gray-500" />
                                )}
                                <div className="space-y-0.5">
                                    <Label className="text-base">Public Access</Label>
                                    <p className="text-sm text-gray-500">
                                        {trip.isPublic
                                            ? "Anyone with the link can view this trip."
                                            : "Only invited users can access this trip."}
                                    </p>
                                </div>
                            </div>
                            {isOwner && (
                                <Switch
                                    checked={trip.isPublic}
                                    onCheckedChange={handlePublicToggle}
                                />
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
