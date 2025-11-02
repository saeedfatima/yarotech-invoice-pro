import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { UserRole } from "@/hooks/useUserRole";

interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  user_email?: string;
}

export const UserManagement = () => {
  const [userRoles, setUserRoles] = useState<UserRoleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("user");

  useEffect(() => {
    loadUserRoles();
  }, []);

  const loadUserRoles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error loading user roles",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setUserRoles(data || []);
    }
    setLoading(false);
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Missing email",
        description: "Please enter a user email",
        variant: "destructive",
      });
      return;
    }

    // Get user ID from auth by admin service
    const { data: { user }, error: getUserError } = await supabase.auth.getUser();
    
    if (getUserError) {
      toast({
        title: "Authentication error",
        description: "Could not verify admin status",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Manual setup required",
      description: "Please use the backend to add user roles directly or provide the user ID instead of email",
      variant: "destructive",
    });
  };

  const handleRemoveRole = async (roleId: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("id", roleId);

    if (error) {
      toast({
        title: "Error removing role",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Role removed successfully" });
      loadUserRoles();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Assign Role</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddRole} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">User Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full">
              Assign Role
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Roles</CardTitle>
        </CardHeader>
        <CardContent>
          {userRoles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No roles assigned yet</p>
          ) : (
            <div className="space-y-3">
              {userRoles.map((userRole) => (
                <div
                  key={userRole.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{userRole.user_id}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {userRole.role}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveRole(userRole.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
