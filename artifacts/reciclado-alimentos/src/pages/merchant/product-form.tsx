import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRoute, useLocation, Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import {
  useCreateProduct, useUpdateProduct, useGetProduct, getGetProductQueryKey,
  useListCategories, getListMerchantProductsQueryKey,
} from "@workspace/api-client-react";
import { MerchantSidebar } from "@/components/MerchantSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const schema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "La categoría es requerida"),
  originalPrice: z.coerce.number().min(1, "Precio requerido"),
  salePrice: z.coerce.number().min(1, "Precio de venta requerido"),
  quantityAvailable: z.coerce.number().min(1, "Stock requerido"),
  unit: z.string().optional(),
  expiryDate: z.string().optional(),
  pickupDeadline: z.string().optional(),
  pickupAddress: z.string().optional(),
  imageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  status: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ProductFormPage() {
  const [matchNew] = useRoute("/merchant/products/new");
  const [matchEdit, paramsEdit] = useRoute("/merchant/products/:id/edit");
  const editId = paramsEdit?.id;
  const isEdit = !!matchEdit && !!editId;

  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories } = useListCategories();
  const { data: existingProduct } = useGetProduct(editId ?? "", {
    query: { enabled: isEdit, queryKey: getGetProductQueryKey(editId ?? "") },
  });
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "", description: "", categoryId: "", originalPrice: 0, salePrice: 0,
      quantityAvailable: 1, unit: "unidades", expiryDate: "", pickupDeadline: "",
      pickupAddress: "", imageUrl: "", status: "AVAILABLE",
    },
  });

  useEffect(() => {
    if (existingProduct) {
      form.reset({
        name: existingProduct.name,
        description: existingProduct.description ?? "",
        categoryId: existingProduct.categoryId ?? "",
        originalPrice: existingProduct.originalPrice,
        salePrice: existingProduct.salePrice,
        quantityAvailable: existingProduct.quantityAvailable,
        unit: existingProduct.unit ?? "unidades",
        expiryDate: existingProduct.expiryDate?.slice(0, 10) ?? "",
        pickupDeadline: existingProduct.pickupDeadline?.slice(0, 10) ?? "",
        pickupAddress: existingProduct.pickupAddress ?? "",
        imageUrl: existingProduct.imageUrl ?? "",
        status: existingProduct.status,
      });
    }
  }, [existingProduct]);

  const originalPrice = form.watch("originalPrice");
  const salePrice = form.watch("salePrice");
  const discount = originalPrice > 0 ? Math.round((1 - salePrice / originalPrice) * 100) : 0;

  const onSubmit = (data: FormData) => {
    const payload = {
      name: data.name,
      description: data.description || null,
      categoryId: data.categoryId,
      originalPrice: Number(data.originalPrice),
      salePrice: Number(data.salePrice),
      quantityAvailable: Number(data.quantityAvailable),
      unit: data.unit || null,
      expiryDate: data.expiryDate || null,
      pickupDeadline: data.pickupDeadline || null,
      pickupAddress: data.pickupAddress || null,
      imageUrl: data.imageUrl || null,
      status: data.status || "AVAILABLE",
    };

    if (isEdit && editId) {
      updateProduct.mutate(
        { id: editId, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListMerchantProductsQueryKey() });
            toast({ title: "Producto actualizado" });
            setLocation("/merchant/products");
          },
          onError: (err: unknown) => {
            const msg = (err as { data?: { error?: string } })?.data?.error ?? "Error al actualizar";
            toast({ title: "Error", description: msg, variant: "destructive" });
          },
        }
      );
    } else {
      createProduct.mutate(
        { data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListMerchantProductsQueryKey() });
            toast({ title: "Producto publicado" });
            setLocation("/merchant/products");
          },
          onError: (err: unknown) => {
            const msg = (err as { data?: { error?: string } })?.data?.error ?? "Error al publicar";
            toast({ title: "Error", description: msg, variant: "destructive" });
          },
        }
      );
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="flex min-h-screen bg-background">
      <MerchantSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/merchant/products">
              <Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="w-4 h-4" /> Volver</Button>
            </Link>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">
                {isEdit ? "Editar producto" : "Nuevo producto"}
              </h1>
            </div>
          </div>

          <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Label>Nombre del producto *</Label>
                <Input {...form.register("name")} placeholder="Ej: Pan de campo artesanal" data-testid="input-name" className="mt-1.5" />
                {form.formState.errors.name && <p className="text-destructive text-xs mt-1">{form.formState.errors.name.message}</p>}
              </div>

              <div>
                <Label>Descripción</Label>
                <Textarea {...form.register("description")} placeholder="Descripción del producto..." data-testid="input-description" className="mt-1.5" rows={3} />
              </div>

              <div>
                <Label>Categoría *</Label>
                <select {...form.register("categoryId")} data-testid="select-category" className="mt-1.5 w-full border border-input rounded-lg px-3 py-2 text-sm bg-background">
                  <option value="">Seleccionar categoría...</option>
                  {categories?.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
                {form.formState.errors.categoryId && <p className="text-destructive text-xs mt-1">{form.formState.errors.categoryId.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Precio original (ARS) *</Label>
                  <Input {...form.register("originalPrice")} type="number" min={0} placeholder="0" data-testid="input-originalPrice" className="mt-1.5" />
                  {form.formState.errors.originalPrice && <p className="text-destructive text-xs mt-1">{form.formState.errors.originalPrice.message}</p>}
                </div>
                <div>
                  <Label>Precio de venta (ARS) *</Label>
                  <Input {...form.register("salePrice")} type="number" min={0} placeholder="0" data-testid="input-salePrice" className="mt-1.5" />
                  {form.formState.errors.salePrice && <p className="text-destructive text-xs mt-1">{form.formState.errors.salePrice.message}</p>}
                </div>
                <div className="flex items-end pb-0.5">
                  <div className={`w-full py-2.5 px-3 rounded-lg text-center font-bold ${discount > 0 ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                    {discount > 0 ? `-${discount}% dto.` : "—"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Stock disponible *</Label>
                  <Input {...form.register("quantityAvailable")} type="number" min={0} placeholder="1" data-testid="input-quantity" className="mt-1.5" />
                  {form.formState.errors.quantityAvailable && <p className="text-destructive text-xs mt-1">{form.formState.errors.quantityAvailable.message}</p>}
                </div>
                <div>
                  <Label>Unidad</Label>
                  <Input {...form.register("unit")} placeholder="Ej: kg, bolsa, unidad" data-testid="input-unit" className="mt-1.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha de vencimiento</Label>
                  <Input {...form.register("expiryDate")} type="date" data-testid="input-expiryDate" className="mt-1.5" />
                </div>
                <div>
                  <Label>Límite de retiro</Label>
                  <Input {...form.register("pickupDeadline")} type="date" data-testid="input-pickupDeadline" className="mt-1.5" />
                </div>
              </div>

              <div>
                <Label>Dirección de retiro</Label>
                <Input {...form.register("pickupAddress")} placeholder="Calle y número donde se retira el producto" data-testid="input-pickupAddress" className="mt-1.5" />
              </div>

              <div>
                <Label>URL de imagen</Label>
                <Input {...form.register("imageUrl")} placeholder="https://..." data-testid="input-imageUrl" className="mt-1.5" />
                {form.formState.errors.imageUrl && <p className="text-destructive text-xs mt-1">{form.formState.errors.imageUrl.message}</p>}
              </div>

              {isEdit && (
                <div>
                  <Label>Estado</Label>
                  <select {...form.register("status")} data-testid="select-status" className="mt-1.5 w-full border border-input rounded-lg px-3 py-2 text-sm bg-background">
                    <option value="AVAILABLE">Disponible</option>
                    <option value="PAUSED">Pausado</option>
                    <option value="DRAFT">Borrador</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white flex-1 h-11" disabled={isPending} data-testid="button-submit">
                  {isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Publicar producto"}
                </Button>
                <Link href="/merchant/products">
                  <Button type="button" variant="outline" className="h-11">Cancelar</Button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
