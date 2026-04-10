import { Link } from "wouter";
import { MapPin, Clock, Tag } from "lucide-react";
import type { Product } from "@workspace/api-client-react";
import { formatARS, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer h-full flex flex-col" data-testid={`card-product-${product.id}`}>
        <div className="relative">
          <div className="h-44 bg-muted overflow-hidden">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
                <span className="text-4xl">{product.category?.icon ?? "🛒"}</span>
              </div>
            )}
          </div>
          <div className="absolute top-3 right-3">
            <Badge className="bg-accent text-accent-foreground font-bold text-sm px-2 py-0.5">
              -{product.discountPercent}%
            </Badge>
          </div>
          {product.isFeatured && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-primary text-primary-foreground text-xs">Destacado</Badge>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col gap-2 flex-1">
          <div>
            <p className="text-xs font-medium text-primary uppercase tracking-wide">{product.category?.name}</p>
            <h3 className="font-semibold text-foreground text-sm mt-0.5 line-clamp-2">{product.name}</h3>
          </div>

          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{product.merchant?.businessName} · {product.merchant?.city}</span>
          </div>

          {product.pickupDeadline && (
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Retirar antes del {formatDate(product.pickupDeadline)}</span>
            </div>
          )}

          <div className="mt-auto pt-3 border-t border-border flex items-end justify-between">
            <div>
              <span className="text-muted-foreground text-xs line-through">{formatARS(product.originalPrice)}</span>
              <p className="text-primary font-bold text-lg leading-tight">{formatARS(product.salePrice)}</p>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <Tag className="w-3.5 h-3.5" />
              <span>{product.quantityAvailable} {product.unit ?? "u."}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
