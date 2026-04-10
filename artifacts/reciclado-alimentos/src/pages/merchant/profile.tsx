import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Store } from "lucide-react";
import { useGetMerchantProfile, useUpdateMerchantProfile } from "@workspace/api-client-react";
import { MerchantSidebar } from "@/components/MerchantSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  businessName: z.string().min(2),
  legalName: z.string().optional(),
  cuit: z.string().optional(),
  category: z.string().optional(),
  phone: z.string().optional(),
  addressLine: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  description: z.string().optional(),
  pickupHours: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export default function MerchantProfilePage() {
  const { data: profile, isLoading } = useGetMerchantProfile();
  const updateProfile = useUpdateMerchantProfile();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      businessName: "", legalName: "", cuit: "", category: "", phone: "",
      addressLine: "", city: "", province: "", postalCode: "",
      description: "", pickupHours: "", logoUrl: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        businessName: profile.businessName ?? "",
        legalName: profile.legalName ?? "",
        cuit: profile.cuit ?? "",
        category: profile.category ?? "",
        phone: profile.phone ?? "",
        addressLine: profile.addressLine ?? "",
        city: profile.city ?? "",
        province: profile.province ?? "",
        postalCode: profile.postalCode ?? "",
        description: profile.description ?? "",
        pickupHours: profile.pickupHours ?? "",
        logoUrl: profile.logoUrl ?? "",
      });
    }
  }, [profile]);

  const onSubmit = (data: FormData) => {
    updateProfile.mutate(
      {
        data: {
          ...data,
          legalName: data.legalName || null,
          cuit: data.cuit || null,
          category: data.category || null,
          phone: data.phone || null,
          addressLine: data.addressLine || null,
          city: data.city || null,
          province: data.province || null,
          postalCode: data.postalCode || null,
          description: data.description || null,
          pickupHours: data.pickupHours || null,
          logoUrl: data.logoUrl || null,
        },
      },
      {
        onSuccess: () => toast({ title: "Perfil actualizado" }),
        onError: (err: unknown) => {
          const msg = (err as { data?: { error?: string } })?.data?.error ?? "Error al actualizar";
          toast({ title: "Error", description: msg, variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <MerchantSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-2xl">
          <div className="mb-8">
            <h1 className="text-2xl font-serif font-bold text-foreground">Perfil del comercio</h1>
            <p className="text-muted-foreground text-sm mt-1">Actualizá los datos de tu comercio</p>
          </div>

          {isLoading ? (
            <div className="bg-muted rounded-2xl h-64 animate-pulse" />
          ) : (
            <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm">
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6 pb-5 border-b border-border">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  {profile?.logoUrl ? (
                    <img src={profile.logoUrl} alt={profile.businessName} className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    <Store className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-foreground">{profile?.businessName}</p>
                  <p className="text-sm text-muted-foreground">{profile?.category}</p>
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre del comercio *</Label>
                    <Input {...form.register("businessName")} data-testid="input-businessName" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Razón social</Label>
                    <Input {...form.register("legalName")} data-testid="input-legalName" className="mt-1.5" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>CUIT</Label>
                    <Input {...form.register("cuit")} data-testid="input-cuit" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <Input {...form.register("phone")} data-testid="input-phone" className="mt-1.5" />
                  </div>
                </div>
                <div>
                  <Label>Dirección</Label>
                  <Input {...form.register("addressLine")} data-testid="input-address" className="mt-1.5" />
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
                <div>
                  <Label>Descripción</Label>
                  <Textarea {...form.register("description")} rows={3} data-testid="input-description" className="mt-1.5" />
                </div>
                <div>
                  <Label>Horarios de retiro</Label>
                  <Input {...form.register("pickupHours")} placeholder="Ej: Lunes a Viernes 9:00 - 18:00" data-testid="input-pickupHours" className="mt-1.5" />
                </div>
                <div>
                  <Label>URL del logo</Label>
                  <Input {...form.register("logoUrl")} placeholder="https://..." data-testid="input-logoUrl" className="mt-1.5" />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white h-11 mt-2"
                  disabled={updateProfile.isPending}
                  data-testid="button-submit"
                >
                  {updateProfile.isPending ? "Guardando..." : "Guardar cambios"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
