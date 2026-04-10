import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { Leaf } from "lucide-react";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import type { AuthResponse } from "@workspace/api-client-react";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
  remember: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const onSubmit = (data: FormData) => {
    loginMutation.mutate(
      { data: { email: data.email, password: data.password } },
      {
        onSuccess: (res: AuthResponse) => {
          login(res.token, res.user);
          toast({ title: "Bienvenido", description: `Hola, ${res.user.email}` });
          if (res.user.role === "MERCHANT") {
            setLocation("/merchant");
          } else {
            setLocation("/products");
          }
        },
        onError: (err: unknown) => {
          const msg = (err as { data?: { error?: string } })?.data?.error ?? "Credenciales inválidas";
          toast({ title: "Error al iniciar sesión", description: msg, variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="font-serif text-2xl font-bold text-foreground">Rescaté</span>
          </Link>
          <h1 className="text-2xl font-serif font-bold text-foreground">Iniciá sesión</h1>
          <p className="text-muted-foreground text-sm mt-1">Accedé a tu cuenta para continuar</p>
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-8 shadow-sm">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" {...form.register("email")} type="email" placeholder="vos@ejemplo.com" data-testid="input-email" className="mt-1.5" />
              {form.formState.errors.email && <p className="text-destructive text-xs mt-1">{form.formState.errors.email.message}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <a href="#" className="text-xs text-primary hover:underline">¿Olvidaste tu contraseña?</a>
              </div>
              <Input id="password" {...form.register("password")} type="password" placeholder="Tu contraseña" data-testid="input-password" />
              {form.formState.errors.password && <p className="text-destructive text-xs mt-1">{form.formState.errors.password.message}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="remember" checked={form.watch("remember")} onCheckedChange={(val) => form.setValue("remember", !!val)} data-testid="checkbox-remember" />
              <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">Recordarme</Label>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white h-11 mt-2" disabled={loginMutation.isPending} data-testid="button-submit">
              {loginMutation.isPending ? "Iniciando..." : "Iniciar sesión"}
            </Button>
          </form>
        </div>

        <p className="text-center text-muted-foreground text-sm mt-5">
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">Registrate</Link>
        </p>
      </div>
    </div>
  );
}
