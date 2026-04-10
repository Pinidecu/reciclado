import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { useGetBuyerProfile, useUpdateBuyerProfile } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  firstName: z.string().min(2, "El nombre es requerido"),
  lastName: z.string().min(2, "El apellido es requerido"),
  phone: z.string().optional(),
  addressLine: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function BuyerProfilePage() {
  const { data: profile, isLoading } = useGetBuyerProfile();
  const updateProfile = useUpdateBuyerProfile();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: "", lastName: "", phone: "", addressLine: "", city: "", province: "" },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        phone: profile.phone ?? "",
        addressLine: profile.addressLine ?? "",
        city: profile.city ?? "",
        province: profile.province ?? "",
      });
    }
  }, [profile]);

  const onSubmit = (data: FormData) => {
    updateProfile.mutate(
      {
        data: {
          ...data,
          phone: data.phone || null,
          addressLine: data.addressLine || null,
          city: data.city || null,
          province: data.province || null,
        },
      },
      {
        onSuccess: () => toast({ title: "Perfil actualizado" }),
        onError: (err: unknown) => {
          const msg = (err as { data?: { error?: string } })?.data?.error ?? "Error";
          toast({ title: "Error", description: msg, variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-1">Mi cuenta</h1>
          <p className="text-muted-foreground">Gestioná tus datos personales</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Link href="/my-orders">
            <div className="bg-card border border-card-border rounded-2xl p-5 hover:shadow-md transition-shadow cursor-pointer">
              <ShoppingBag className="w-8 h-8 text-primary mb-3" />
              <p className="font-semibold text-foreground">Mis compras</p>
              <p className="text-sm text-muted-foreground mt-0.5">Ver historial de pedidos</p>
            </div>
          </Link>
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
            <User className="w-8 h-8 text-primary mb-3" />
            <p className="font-semibold text-foreground">Datos personales</p>
            <p className="text-sm text-muted-foreground mt-0.5">Editando ahora</p>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-muted rounded-2xl h-64 animate-pulse" />
        ) : (
          <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre *</Label>
                  <Input {...form.register("firstName")} data-testid="input-firstName" className="mt-1.5" />
                  {form.formState.errors.firstName && <p className="text-destructive text-xs mt-1">{form.formState.errors.firstName.message}</p>}
                </div>
                <div>
                  <Label>Apellido *</Label>
                  <Input {...form.register("lastName")} data-testid="input-lastName" className="mt-1.5" />
                  {form.formState.errors.lastName && <p className="text-destructive text-xs mt-1">{form.formState.errors.lastName.message}</p>}
                </div>
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input {...form.register("phone")} placeholder="011-XXXX-XXXX" data-testid="input-phone" className="mt-1.5" />
              </div>
              <div>
                <Label>Dirección</Label>
                <Input {...form.register("addressLine")} placeholder="Calle y número" data-testid="input-address" className="mt-1.5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ciudad</Label>
                  <Input {...form.register("city")} data-testid="input-city" className="mt-1.5" />
                </div>
                <div>
                  <Label>Provincia</Label>
                  <Input {...form.register("province")} data-testid="input-province" className="mt-1.5" />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white h-11"
                disabled={updateProfile.isPending}
                data-testid="button-submit"
              >
                {updateProfile.isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </form>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
