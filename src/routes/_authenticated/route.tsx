import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { isAdmin } from "@/lib/surveys";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/accesso" });
    const admin = await isAdmin(data.user.id);
    if (!admin) throw redirect({ to: "/accesso", search: { negato: true } });
    return { user: data.user };
  },
  component: () => <Outlet />,
});
