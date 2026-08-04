import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { isAdmin } from "@/lib/surveys";

export const Route = createFileRoute("/accesso")({
  head: () => ({
    meta: [
      { title: "Accesso gestore | Dimmi, ti ascolto" },
      {
        name: "description",
        content:
          "Area riservata al gestore delle indagini di quartiere: accedi per creare nuove indagini e leggere le risposte.",
      },
      { property: "og:title", content: "Accesso gestore" },
      {
        property: "og:description",
        content: "Area riservata per gestire le indagini sui quartieri di Pordenone.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      if (await isAdmin(data.user.id)) navigate({ to: "/gestione" });
      else setInfo("Questo account non è il gestore autorizzato.");
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setInfo(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setBusy(false);
      toast.error("Accesso non riuscito. Controlla email e password.");
      return;
    }
    const admin = await isAdmin(data.user.id);
    setBusy(false);
    if (!admin) {
      await supabase.auth.signOut();
      setInfo("Questo account non è abilitato a gestire le indagini.");
      return;
    }
    navigate({ to: "/gestione" });
  };

  const resetPassword = async () => {
    if (!email) {
      toast.error("Inserisci prima la tua email.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else setInfo("Email di recupero inviata.");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-10">
        <h1 className="font-display text-3xl text-primary">Accesso gestore</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Area riservata all'unico account gestore delle indagini.
        </p>

        {info && (
          <p className="mt-4 rounded-md bg-accent/20 p-3 text-sm text-foreground">{info}</p>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Attendere…" : "Accedi"}
          </Button>
        </form>

        <div className="mt-4 flex flex-col gap-2 text-sm">
          <button type="button" className="text-primary underline" onClick={resetPassword}>
            Password dimenticata?
          </button>
          <Link to="/" className="text-muted-foreground underline">
            Torna al sito pubblico
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
