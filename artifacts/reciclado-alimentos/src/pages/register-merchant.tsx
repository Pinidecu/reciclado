import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { Leaf, ArrowLeft } from "lucide-react";
import { useRegisterMerchant } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import type { AuthResponse } from "@workspace/api-client-react";

const schema = z.object({
  businessName: z.string().min(2, "El nombre es requerido"),
  legalName: z.string().optional(),
  cuit: z.string().optional(),
  category: z.string().min(1, "La categoría es requerida"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(6, "El teléfono es requerido"),
  addressLine: z.string().min(5, "La dirección es requerida"),
  city: z.string().min(2, "La ciudad es requerida"),
  province: z.string().min(2, "La provincia es requerida"),
  postalCode: z.string().optional(),
  description: z.string().optional(),
  pickupHours: z.string().optional(),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  confirmPassword: z.string(),
  terms: z.boolean().refine(v => v, "Debés aceptar los términos"),
}).refine(d => d.password === d.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

const PROVINCES = ["Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"];
const CATEGORIES = ["Panadería", "Almacén", "Verdulería", "Lácteos", "Carnicería", "Pescadería", "Dietética", "Fiambrería", "Comidas preparadas", "Bebidas", "Confitería", "Supermercado", "Otro"];

export default function RegisterMerchantPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const registerMutation = useRegisterMerchant();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      businessName: "", legalName: "", cuit: "", category: "", email: "",
      phone: "", addressLine: "", city: "", province: "", postalCode: "",
      description: "", pickupHours: "", password: "", confirmPassword: "", terms: false,
    },
  });

  const onSubmit = (data: FormData) => {
    registerMutation.mutate(
      {
        data: {
          email: data.email,
          password: data.password,
          businessName: data.businessName,
          legalName: data.legalName || null,
          cuit: data.cuit || null,
          category: data.category,
          phone: data.phone,
          addressLine: data.addressLine,
          city: data.city,
          province: data.province,
          postalCode: data.postalCode || null,
          description: data.description || null,
          pickupHours: data.pickupHours || null,
        },
      },
      {
        onSuccess: (res: AuthResponse) => {
          login(res.token, res.user);
          toast({ title: "Registro exitoso", description: "Bienvenido a Rescaté" });
          setLocation("/merchant");
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
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/register">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="w-4 h-4" /> Volver
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif font-bold text-lg">Rescaté</span>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-8 shadow-sm">
          <h1 className="text-2xl font-serif font-bold text-foreground mb-1">Registrá tu comercio</h1>
          <p className="text-muted-foreground mb-6 text-sm">Completá los datos para empezar a publicar productos</p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Nombre del comercio *</Label>
                <Input {...form.register("businessName")} placeholder="Ej: Panadería La Buena" data-testid="input-businessName" className="mt-1.5" />
                {form.formState.errors.businessName && <p className="text-destructive text-xs mt-1">{form.formState.errors.businessName.message}</p>}
              </div>
              <div>
                <Label>Razón social</Label>
                <Input {...form.register("legalName")} placeholder="Opcional" data-testid="input-legalName" className="mt-1.5" />
              </div>
              <div>
                <Label>CUIT</Label>
                <Input {...form.register("cuit")} placeholder="XX-XXXXXXXX-X" data-testid="input-cuit" className="mt-1.5" />
              </div>
              <div>
                <Label>Rubro *</Label>
                <select {...form.register("category")} data-testid="select-category" className="mt-1.5 w-full border border-input rounded-lg px-3 py-2 text-sm bg-background">
                  <option value="">Seleccionar...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {form.formState.errors.category && <p className="text-destructive text-xs mt-1">{form.formState.errors.category.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Email *</Label>
                <Input {...form.register("email")} type="email" placeholder="comercio@ejemplo.com" data-testid="input-email" className="mt-1.5" />
                {form.formState.errors.email && <p className="text-destructive text-xs mt-1">{form.formState.errors.email.message}</p>}
              </div>
              <div>
                <Label>Teléfono *</Label>
                <Input {...form.register("phone")} placeholder="011-XXXX-XXXX" data-testid="input-phone" className="mt-1.5" />
                {form.formState.errors.phone && <p className="text-destructive text-xs mt-1">{form.formState.errors.phone.message}</p>}
              </div>
            </div>

            <div>
              <Label>Dirección *</Label>
              <Input {...form.register("addressLine")} placeholder="Calle y número" data-testid="input-addressLine" className="mt-1.5" />
              {form.formState.errors.addressLine && <p className="text-destructive text-xs mt-1">{form.formState.errors.addressLine.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Ciudad *</Label>
                <Input {...form.register("city")} placeholder="Ciudad" data-testid="input-city" className="mt-1.5" />
                {form.formState.errors.city && <p className="text-destructive text-xs mt-1">{form.formState.errors.city.message}</p>}
              </div>
              <div>
                <Label>Provincia *</Label>
                <select {...form.register("province")} data-testid="select-province" className="mt-1.5 w-full border border-input rounded-lg px-3 py-2 text-sm bg-background">
                  <option value="">Seleccionar...</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {form.formState.errors.province && <p className="text-destructive text-xs mt-1">{form.formState.errors.province.message}</p>}
              </div>
              <div>
                <Label>Código postal</Label>
                <Input {...form.register("postalCode")} placeholder="CP" data-testid="input-postalCode" className="mt-1.5" />
              </div>
            </div>

            <div>
              <Label>Descripción breve</Label>
              <Textarea {...form.register("description")} placeholder="Contale a tus clientes sobre tu comercio..." data-testid="input-description" className="mt-1.5" rows={3} />
            </div>

            <div>
              <Label>Horarios de retiro</Label>
              <Input {...form.register("pickupHours")} placeholder="Ej: Lunes a Viernes 9:00 - 18:00" data-testid="input-pickupHours" className="mt-1.5" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
              <div>
                <Label>Contraseña *</Label>
                <Input {...form.register("password")} type="password" placeholder="Mínimo 6 caracteres" data-testid="input-password" className="mt-1.5" />
                {form.formState.errors.password && <p className="text-destructive text-xs mt-1">{form.formState.errors.password.message}</p>}
              </div>
              <div>
                <Label>Confirmar contraseña *</Label>
                <Input {...form.register("confirmPassword")} type="password" placeholder="Repetí la contraseña" data-testid="input-confirmPassword" className="mt-1.5" />
                {form.formState.errors.confirmPassword && <p className="text-destructive text-xs mt-1">{form.formState.errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={form.watch("terms")}
                onCheckedChange={(val) => form.setValue("terms", !!val)}
                data-testid="checkbox-terms"
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                Acepto los <a href="#" className="text-primary hover:underline">Términos y Condiciones</a> y la <a href="#" className="text-primary hover:underline">Política de Privacidad</a>
              </Label>
            </div>
            {form.formState.errors.terms && <p className="text-destructive text-xs">{form.formState.errors.terms.message}</p>}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white h-11"
              disabled={registerMutation.isPending}
              data-testid="button-submit"
            >
              {registerMutation.isPending ? "Registrando..." : "Crear cuenta de comercio"}
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
