import { isAdminAuthenticated } from "@/lib/admin-auth";
import { fetchAdminStats } from "@/lib/admin-stats";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return <AdminLogin />;
  }

  const stats = await fetchAdminStats();

  return (
    <AdminDashboard
      initialStats={
        stats ?? {
          registeredUsers: 0,
          wallSignatures: 0,
          framesFilled: 0,
          maxFrames: 100,
          completionPercentage: 0,
        }
      }
    />
  );
}
