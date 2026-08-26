"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, UserPlus } from "lucide-react";
import { createStockReception } from "@/app/(dashboard)/stock/actions";

interface ProductOption {
  id: string;
  code: string;
  name: string;
  stock: number;
}

interface SupplierOption {
  id: string;
  name: string;
  phone: string | null;
}

interface CartItem {
  productId: string;
  quantity: number;
}

export default function StockMovementModal({
  open,
  onClose,
  products,
  suppliers,
}: {
  open: boolean;
  onClose: () => void;
  products: ProductOption[];
  suppliers: SupplierOption[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [supplierQuery, setSupplierQuery] = useState("");
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [supplierPhone, setSupplierPhone] = useState("");
  const [supplierDropdownOpen, setSupplierDropdownOpen] = useState(false);
  const supplierBoxRef = useRef<HTMLDivElement>(null);

  const [productQuery, setProductQuery] = useState("");
  const [pickedProductId, setPickedProductId] = useState<string | null>(null);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [pickedQty, setPickedQty] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const productBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (supplierBoxRef.current && !supplierBoxRef.current.contains(e.target as Node)) setSupplierDropdownOpen(false);
      if (productBoxRef.current && !productBoxRef.current.contains(e.target as Node)) setProductDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredSuppliers = supplierQuery.trim()
    ? suppliers.filter((s) => s.name.toLowerCase().includes(supplierQuery.toLowerCase())).slice(0, 6)
    : suppliers.slice(0, 6);

  const filteredProducts = productQuery.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(productQuery.toLowerCase()) || p.code.toLowerCase().includes(productQuery.toLowerCase())).slice(0, 6)
    : products.slice(0, 6);

  function selectSupplier(s: SupplierOption) {
    setSupplierId(s.id);
    setSupplierQuery(s.name);
    setSupplierPhone(s.phone ?? "");
    setSupplierDropdownOpen(false);
  }

  function handleSupplierQueryChange(v: string) {
    setSupplierQuery(v);
    setSupplierId(null);
    setSupplierDropdownOpen(true);
  }

  function selectProduct(p: ProductOption) {
    setPickedProductId(p.id);
    setProductQuery(p.name);
    setProductDropdownOpen(false);
  }

  function handleProductQueryChange(v: string) {
    setProductQuery(v);
    setPickedProductId(null);
    setProductDropdownOpen(true);
  }

  function addToCart() {
    if (!pickedProductId || pickedQty <= 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === pickedProductId);
      if (existing) return prev.map((i) => (i.productId === pickedProductId ? { ...i, quantity: i.quantity + pickedQty } : i));
      return [...prev, { productId: pickedProductId, quantity: pickedQty }];
    });
    setProductQuery("");
    setPickedProductId(null);
    setPickedQty(1);
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  function reset() {
    setSupplierQuery("");
    setSupplierId(null);
    setSupplierPhone("");
    setProductQuery("");
    setPickedProductId(null);
    setPickedQty(1);
    setCart([]);
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit() {
    setError(null);
    if (!supplierQuery.trim()) {
      setError("Indiquez le fournisseur.");
      return;
    }
    if (cart.length === 0) {
      setError("Ajoutez au moins un produit reçu.");
      return;
    }
    startTransition(async () => {
      try {
        await createStockReception({
          supplierId,
          newSupplier: supplierId ? null : { name: supplierQuery.trim(), phone: supplierPhone },
          items: cart,
        });
        handleClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Une erreur est survenue.");
      }
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className="fixed inset-0 bg-black/40 z-50" />
          <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }} transition={{ duration: 0.25, ease: "easeOut" }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
<div className="bg-white rounded-xl w-full max-w-md p-5 sm:p-6 mx-4 shadow-xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-ink">Réception fournisseur</h2>
                <button onClick={handleClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/[0.04] text-ink-faint">
                  <X size={17} />
                </button>
              </div>

              <div ref={supplierBoxRef} className="relative mb-4">
                <label className="block text-xs font-medium text-ink-soft mb-1.5">Fournisseur</label>
                <div className="relative">
                  <input
                    value={supplierQuery}
                    onChange={(e) => handleSupplierQueryChange(e.target.value)}
                    onFocus={() => setSupplierDropdownOpen(true)}
                    placeholder="Rechercher, ou taper un nouveau nom..."
                    className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all"
                  />
                  {!supplierId && supplierQuery.trim() && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-mono text-brand-600">
                      <UserPlus size={11} /> NOUVEAU
                    </span>
                  )}
                </div>
                {supplierDropdownOpen && filteredSuppliers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-black/[0.08] rounded-lg shadow-lg overflow-hidden z-10 max-h-44 overflow-y-auto">
                    {filteredSuppliers.map((s) => (
                      <button key={s.id} type="button" onClick={() => selectSupplier(s)} className="w-full text-left px-3.5 py-2.5 text-sm hover:bg-[#FAFAFA] transition-colors">
                        <p className="text-ink">{s.name}</p>
                        {s.phone && <p className="text-[11px] font-mono text-ink-faint">{s.phone}</p>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {!supplierId && (
                <input value={supplierPhone} onChange={(e) => setSupplierPhone(e.target.value)} placeholder="Téléphone (optionnel)" className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all mb-4" />
              )}

              <div className="mb-4 p-3.5 bg-[#FAFAFA] rounded-lg border border-black/[0.05]">
                <p className="text-xs font-medium text-ink-soft mb-2">Produits reçus</p>
                <div className="flex gap-2">
                  <div ref={productBoxRef} className="relative flex-1 min-w-0">
                    <input
                      value={productQuery}
                      onChange={(e) => handleProductQueryChange(e.target.value)}
                      onFocus={() => setProductDropdownOpen(true)}
                      placeholder="Rechercher un produit..."
                      className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all bg-white"
                    />
                    {productDropdownOpen && filteredProducts.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-black/[0.08] rounded-lg shadow-lg overflow-hidden z-10 max-h-44 overflow-y-auto">
                        {filteredProducts.map((p) => (
                          <button key={p.id} type="button" onClick={() => selectProduct(p)} className="w-full text-left px-3.5 py-2.5 text-sm hover:bg-[#FAFAFA] transition-colors">
                            <p className="text-ink truncate">{p.name}</p>
                            <p className="text-[11px] font-mono text-ink-faint">{p.code} — {p.stock} u en stock</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input type="number" min={1} value={pickedQty} onChange={(e) => setPickedQty(Number(e.target.value))} className="w-16 border border-black/10 rounded-lg px-2 py-2.5 text-sm font-mono outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all" />
                  <button type="button" onClick={addToCart} disabled={!pickedProductId} className="w-10 h-10 shrink-0 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white flex items-center justify-center transition-colors">
                    <Plus size={17} />
                  </button>
                </div>
              </div>

              {cart.length > 0 && (
                <div className="mb-4 border border-black/[0.06] rounded-lg overflow-hidden">
                  {cart.map((item) => {
                    const product = products.find((p) => p.id === item.productId);
                    if (!product) return null;
                    return (
                      <div key={item.productId} className="flex items-center gap-3 px-3.5 py-2.5 text-sm border-b border-black/[0.05] last:border-0">
                        <span className="flex-1 text-ink truncate">{product.name}</span>
                        <span className="font-mono text-xs text-ink-faint">{product.stock} + {item.quantity} = {product.stock + item.quantity} u</span>
                        <button onClick={() => removeFromCart(item.productId)} className="text-ink-faint hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

              <div className="flex gap-2">
                <button type="button" onClick={handleClose} className="flex-1 border border-black/10 text-ink-soft text-sm font-medium rounded-lg py-2.5 hover:bg-black/[0.02] transition-colors">Annuler</button>
                <button type="button" onClick={handleSubmit} disabled={isPending || cart.length === 0} className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg py-2.5 transition-colors">
                  {isPending ? "Enregistrement..." : "Valider la réception"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}