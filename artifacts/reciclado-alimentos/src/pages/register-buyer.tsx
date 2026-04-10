import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { Leaf, ArrowLeft } from "lucide-react";
import { useRegisterBuyer } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import type { AuthResponse } from "@workspace/api-client-react";

const schema = z.object({
  firstName: z.string().min(2, "El nombre es requerido"),
  lastName: z.string().min(2, "El apellido es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(6, "El teléfono es requerido"),
  addressLine: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  confirmPassword: z.string(),
  terms: z.boolean().refine(v => v, "Debés aceptar los términos"),
}).refine(d => d.password === d.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

const PROVINCES = ["Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"];

export default function RegisterBuyerPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const registerMutation = useRegisterBuyer();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "", lastName: "", email: "", phone: "",
      addressLine: "", city: "", province: "",
      password: "", confirmPassword: "", terms: false,
    },
  });

  const onSubmit = (data: FormData) => {
    registerMutation.mutate(
      {
        data: {
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          addressLine: data.addressLine || null,
          city: data.city || null,
          province: data.province || null,
        },
      },
      {
        onSuccess: (res: AuthResponse) => {
          login(res.token, res.user);
          toast({ title: "Registro exitoso", description: "Bienvenido a Rescaté" });
          setLocation("/products");
        },
        onError: (err: unknown) => {
          const msg = (err as { data?: { error?: string } })?.data?.error ?? "Error al registrar";
          toast({ title: "Error", description: msg, variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/register">
            <Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="w-4 h-4" /> Volver</Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif font-bold text-lg">Rescaté</span>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-8 shadow-sm">
          <h1 className="text-2xl font-serif font-bold text-foreground mb-1">Creá tu cuenta</h1>
          <p className="text-muted-foreground mb-6 text-sm">Empezá a encontrar ofertas cerca tuyo</p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombre *</Label>
                <Input {...form.register("firstName")} placeholder="Juan" data-testid="input-firstName" className="mt-1.5" />
                {form.formState.errors.firstName && <p className="text-destructive text-xs mt-1">{form.formState.errors.firstName.message}</p>}
              </div>
              <div>
                <Label>Apellido *</Label>
                <Input {...form.register("lastName")} placeholder="García" data-testid="input-lastName" className="mt-1.5" />
                {form.formState.errors.lastName && <p className="text-destructive text-xs mt-1">{form.formState.errors.lastName.message}</p>}
              </div>
            </div>
            <div>
              <Label>Email *</Label>
              <Input {...form.register("email")} type="email" placeholder="vos@ejemplo.com" data-testid="input-email" className="mt-1.5" />
              {form.formState.errors.email && <p className="text-destructive text-xs mt-1">{form.formState.errors.email.message}</p>}
            </div>
            <div>
              <Label>Teléfono *</Label>
              <Input {...form.register("phone")} placeholder="011-XXXX-XXXX" data-testid="input-phone" className="mt-1.5" />
              {form.formState.errors.phone && <p className="text-destructive text-xs mt-1">{form.formState.errors.phone.message}</p>}
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3">Ubicación (opcional, para mostrar comercios cercanos)</p>
              <div>
                <Label>Dirección</Label>
                <Input {...form.register("addressLine")} placeholder="Calle y número" data-testid="input-addressLine" className="mt-1.5" />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <Label>Ciudad</Label>
                  <Input {...form.register("city")} placeholder="Ciudad" data-testid="input-city" className="mt-1.5" />
                </div>
                <div>
                  <Label>Provincia</Label>
                  <select {...form.register("province")} data-testid="select-province" className="mt-1.5 w-full border border-input rounded-lg px-3 py-2 text-sm bg-background">
                    <option value="">Seleccionar...</option>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
              <div>
                <Label>Contraseña *</Label>
                <Input {...form.register("password")} type="password" placeholder="Mínimo 6 caracteres" data-testid="input-password" className="mt-1.5" />
                {form.formState.errors.password && <p className="text-destructive text-xs mt-1">{form.formState.errors.password.message}</p>}
              </div>
              <div>
                <Label>Confirmar *</Label>
                <Input {...form.register("confirmPassword")} type="password" placeholder="Repetir" data-testid="input-confirmPassword" className="mt-1.5" />
                {form.formState.errors.confirmPassword && <p className="text-destructive text-xs mt-1">{form.formState.errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox id="terms" checked={form.watch("terms")} onCheckedChange={(val) => form.setValue("terms", !!val)} data-testid="checkbox-terms" />
              <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                Acepto los <a href="#" className="text-primary hover:underline">Términos y Condiciones</a>
              </Label>
            </div>
            {form.formState.errors.terms && <p className="text-destructive text-xs">{form.formState.errors.terms.message}</p>}

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white h-11" disabled={registerMutation.isPending} data-testid="button-submit">
              {registerMutation.isPending ? "Registrando..." : "Crear cuenta"}
            </Button>
          </form>

          <p className="text-center text-muted-foreground text-sm mt-4">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">Iniciá sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
