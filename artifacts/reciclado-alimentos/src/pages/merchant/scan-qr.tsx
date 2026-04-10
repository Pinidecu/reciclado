import { useState } from "react";
import { QrCode, CheckCircle2, AlertTriangle, Search } from "lucide-react";
import { useValidateOrder, getListMerchantOrdersQueryKey } from "@workspace/api-client-react";
import { MerchantSidebar } from "@/components/MerchantSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { formatARS } from "@/lib/format";

export default function ScanQRPage() {
  const [code, setCode] = useState("");
  const [validatedOrder, setValidatedOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const validatePickup = useValidateOrder();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleValidate = () => {
    if (!code.trim()) {
      toast({ title: "Ingresá un código", variant: "destructive" });
      return;
    }
    setError(null);
    setValidatedOrder(null);
    validatePickup.mutate(
      { data: { code: code.trim() } },
      {
        onSuccess: (data: any) => {
          setValidatedOrder(data);
          toast({ title: "Código validado", description: "El pedido fue marcado como entregado" });
          queryClient.invalidateQueries({ queryKey: getListMerchantOrdersQueryKey() });
          setCode("");
        },
        onError: (err: unknown) => {
          const msg = (err as { data?: { error?: string } })?.data?.error ?? "Código inválido o ya utilizado";
          setError(msg);
          toast({ title: "Error de validación", description: msg, variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <MerchantSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-xl">
          <div className="mb-8">
            <h1 className="text-2xl font-serif font-bold text-foreground">Validar retiro con QR</h1>
            <p className="text-muted-foreground text-sm mt-1">Ingresá el código del comprador para confirmar el retiro</p>
          </div>

          {/* QR scanner placeholder */}
          <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm mb-6">
            <div className="h-56 bg-muted/50 flex flex-col items-center justify-center gap-3 border-b border-border">
              <div className="w-24 h-24 border-2 border-dashed border-primary/40 rounded-xl flex items-center justify-center">
                <QrCode className="w-10 h-10 text-primary/40" />
              </div>
              <p className="text-sm text-muted-foreground">Escáner QR (demo — ingresá el código manualmente)</p>
            </div>

            <div className="p-5">
              <Label htmlFor="code" className="mb-2 block">Código de retiro</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="Ej: A1B2C3D4"
                  className="font-mono uppercase tracking-widest"
                  onKeyDown={e => e.key === "Enter" && handleValidate()}
                  data-testid="input-pickup-code"
                />
                <Button
                  onClick={handleValidate}
                  disabled={validatePickup.isPending || !code}
                  className="bg-primary text-white gap-2 shrink-0"
                  data-testid="button-validate"
                >
                  <Search className="w-4 h-4" />
                  {validatePickup.isPending ? "Validando..." : "Validar"}
                </Button>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 bg-destructive/5 border border-destructive/20 rounded-xl p-4 mb-4" data-testid="error-message">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive text-sm">Código inválido</p>
                <p className="text-destructive/80 text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Success */}
          {validatedOrder && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5" data-testid="success-message">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Retiro confirmado</p>
                  <p className="text-sm text-muted-foreground mt-0.5">El pedido fue marcado como entregado</p>

                  <div className="mt-4 bg-white rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Producto</span>
                      <span className="font-medium text-foreground">{validatedOrder.order?.product?.name ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Comprador</span>
                      <span className="font-medium text-foreground">
                        {validatedOrder.order?.buyer?.firstName} {validatedOrder.order?.buyer?.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cantidad</span>
                      <span className="font-medium text-foreground">x{validatedOrder.order?.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-bold text-primary">{formatARS(validatedOrder.order?.total ?? 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 bg-card border border-card-border rounded-2xl p-5">
            <h3 className="font-medium text-foreground mb-2">Instrucciones</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="font-bold text-primary shrink-0">1.</span> Pedile al comprador que muestre su código QR o el código alfanumérico</li>
              <li className="flex gap-2"><span className="font-bold text-primary shrink-0">2.</span> Ingresá el código en el campo de arriba</li>
              <li className="flex gap-2"><span className="font-bold text-primary shrink-0">3.</span> El sistema verificará que el pago esté confirmado</li>
              <li className="flex gap-2"><span className="font-bold text-primary shrink-0">4.</span> Entregá el producto y confirmá el retiro</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
