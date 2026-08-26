"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, MessageCircle, Mail, Check, XCircle, Download, UserPlus, PackagePlus } from "lucide-react";
import { createSale } from "@/app/(dashboard)/ventes/actions";
import { downloadReceiptPDF, ReceiptData } from "@/lib/receipt-pdf";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { useCurrentUser } from "@/context/UserContext";
import QuickAddProductModal from "./QuickAddProductModal";

interface ClientOption {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

interface ProductOption {
  id: string;
  code: string;
  name: string;
  stock: number;
  sellingPrice: number;
}

interface Category {
  id: string;
  name: string;
}

interface CartItem {
  productId: string;
  quantity: number;
}

interface DeliveryResult {
  emailSent: boolean;
  emailError?: string;
  whatsappSent: boolean;
  whatsappError?: string;
}

function formatXOF(n: number) {
  return n.toLocaleString("fr-FR") + " XOF";
}

export default function SaleModal({
  open,
  onClose,
  clients,
  products,
  categories,
  currentUserName,
}: {
  open: boolean;
  onClose: () => void;
  clients: ClientOption[];
  products: ProductOption[];
  categories: Category[];
  currentUserName: string;
}) {
  const { user } = useCurrentUser();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ receipt: ReceiptData; phone: string | null; delivery: DeliveryResult } | null>(null);

  // Client — champ de recherche/saisie libre
  const [clientQuery, setClientQuery] = useState("");
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const clientBoxRef = useRef<HTMLDivElement>(null);

  // Produit — champ de recherche/saisie libre
  const [productQuery, setProductQuery] = useState("");
  const [pickedProduct, setPickedProduct] = useState<ProductOption[]>(products); // liste locale, s'enrichit si création rapide
  const [pickedProductId, setPickedProductId] = useState<string | null>(null);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [pickedQty, setPickedQty] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const productBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (clientBoxRef.current && !clientBoxRef.current.contains(e.target as Node)) setClientDropdownOpen(false);
      if (productBoxRef.current && !productBoxRef.current.contains(e.target as Node)) setProductDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredClients = clientQuery.trim()
    ? clients.filter((c) => c.name.toLowerCase().includes(clientQuery.toLowerCase())).slice(0, 6)
    : clients.slice(0, 6);

  const filteredProducts = productQuery.trim()
    ? pickedProduct.filter((p) => p.name.toLowerCase().includes(productQuery.toLowerCase()) || p.code.toLowerCase().includes(productQuery.toLowerCase())).slice(0, 6)
    : pickedProduct.slice(0, 6);

  const total = cart.reduce((sum, item) => {
    const product = pickedProduct.find((p) => p.id === item.productId);
    return sum + (product ? product.sellingPrice * item.quantity : 0);
  }, 0);

  function selectClient(c: ClientOption) {
    setClientId(c.id);
    setClientQuery(c.name);
    setNewClientPhone(c.phone ?? "");
    setNewClientEmail(c.email ?? "");
    setClientDropdownOpen(false);
  }

  function handleClientQueryChange(value: string) {
    setClientQuery(value);
    setClientId(null);
    setClientDropdownOpen(true);
  }

  function selectProduct(p: ProductOption) {
    setPickedProductId(p.id);
    setProductQuery(p.name);
    setProductDropdownOpen(false);
  }

  function handleProductQueryChange(value: string) {
    setProductQuery(value);
    setPickedProductId(null);
    setProductDropdownOpen(true);
  }

  function addToCart() {
    if (!pickedProductId || pickedQty <= 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === pickedProductId);
      if (existing) {
        return prev.map((i) => (i.productId === pickedProductId ? { ...i, quantity: i.quantity + pickedQty } : i));
      }
      return [...prev, { productId: pickedProductId, quantity: pickedQty }];
    });
    setProductQuery("");
    setPickedProductId(null);
    setPickedQty(1);
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  function handleProductCreated(newProduct: { id: string; code: string; name: string; stock: number; sellingPrice: number }) {
    setPickedProduct((prev) => [...prev, newProduct]);
    selectProduct(newProduct);
  }

  function reset() {
    setCart([]);
    setClientId(null);
    setClientQuery("");
    setNewClientPhone("");
    setNewClientEmail("");
    setProductQuery("");
    setPickedProductId(null);
    setPickedQty(1);
    setError(null);
    setSuccess(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit() {
    setError(null);

    if (!clientQuery.trim()) {
      setError("Indiquez le nom du client.");
      return;
    }
    if (cart.length === 0) {
      setError("Ajoutez au moins un article.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createSale({
          clientId,
          newClient: clientId ? null : { name: clientQuery.trim(), phone: newClientPhone, email: newClientEmail },
          items: cart,
        });

        const receipt: ReceiptData = {
          number: result.number,
          date: new Date().toLocaleDateString("fr-FR"),
          client: result.clientName,
          vendeur: currentUserName,
          items: cart.map((item) => {
            const product = pickedProduct.find((p) => p.id === item.productId)!;
            return { name: product.name, quantity: item.quantity, unitPrice: product.sellingPrice };
          }),
          total,
        };

        downloadReceiptPDF(receipt);
        setSuccess({ receipt, phone: result.clientPhone, delivery: result.delivery });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Une erreur est survenue.");
      }
    });
  }

  const manualWaLink = success?.phone
    ? buildWhatsAppLink(success.phone, `Bonjour, voici votre facture N. ${success.receipt.number} de ${formatXOF(success.receipt.total)} - Tout Est Grâce. Merci de votre confiance.`)
    : null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className="fixed inset-0 bg-black/40 z-50" />
          <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }} transition={{ duration: 0.25, ease: "easeOut" }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
<div className="bg-white rounded-xl w-full max-w-md p-5 sm:p-6 mx-4 shadow-xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>              {success ? (
                <div className="py-2">
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                      <Check size={26} className="text-emerald-600" />
                    </div>
                    <h2 className="text-base font-semibold text-ink mb-1">Vente enregistrée</h2>
                    <p className="text-sm text-ink-soft">Facture N. {success.receipt.number} — {formatXOF(success.receipt.total)}</p>
                  </div>

                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-[#FAFAFA] border border-black/[0.05]">
                      <Mail size={15} className={success.delivery.emailSent ? "text-emerald-600" : "text-ink-faint"} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-ink">{success.delivery.emailSent ? "Facture envoyée par e-mail" : "E-mail non envoyé"}</p>
                        {!success.delivery.emailSent && success.delivery.emailError && <p className="text-[11px] text-ink-faint truncate">{success.delivery.emailError}</p>}
                      </div>
                      {success.delivery.emailSent ? <Check size={15} className="text-emerald-600 shrink-0" /> : <XCircle size={15} className="text-ink-faint shrink-0" />}
                    </div>

                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-[#FAFAFA] border border-black/[0.05]">
                      <MessageCircle size={15} className={success.delivery.whatsappSent ? "text-emerald-600" : "text-ink-faint"} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-ink">{success.delivery.whatsappSent ? "Facture envoyée sur WhatsApp" : "WhatsApp non envoyé"}</p>
                        {!success.delivery.whatsappSent && success.delivery.whatsappError && <p className="text-[11px] text-ink-faint truncate">{success.delivery.whatsappError}</p>}
                      </div>
                      {success.delivery.whatsappSent ? <Check size={15} className="text-emerald-600 shrink-0" /> : <XCircle size={15} className="text-ink-faint shrink-0" />}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {!success.delivery.whatsappSent && manualWaLink && (
                      <a href={manualWaLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg py-2.5 transition-colors">
                        <MessageCircle size={16} />
                        Envoyer manuellement sur WhatsApp
                      </a>
                    )}
                    <button type="button" onClick={() => downloadReceiptPDF(success.receipt)} className="flex items-center justify-center gap-2 border border-black/10 text-ink-soft text-sm font-medium rounded-lg py-2.5 hover:bg-black/[0.02] transition-colors">
                      <Download size={15} />
                      Retélécharger la facture
                    </button>
                    <button type="button" onClick={handleClose} className="text-sm text-ink-faint py-2">Fermer</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold text-ink">Nouvelle vente</h2>
                    <button onClick={handleClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/[0.04] text-ink-faint">
                      <X size={17} />
                    </button>
                  </div>

                  {/* Recherche client */}
                  <div ref={clientBoxRef} className="relative mb-3">
                    <label className="block text-xs font-medium text-ink-soft mb-1.5">Client</label>
                    <div className="relative">
                      <input
                        value={clientQuery}
                        onChange={(e) => handleClientQueryChange(e.target.value)}
                        onFocus={() => setClientDropdownOpen(true)}
                        placeholder="Tapez un nom existant, ou un nouveau nom..."
                        className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all"
                      />
                      {!clientId && clientQuery.trim() && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-mono text-brand-600">
                          <UserPlus size={11} /> NOUVEAU
                        </span>
                      )}
                    </div>
                    {clientDropdownOpen && filteredClients.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-black/[0.08] rounded-lg shadow-lg overflow-hidden z-10 max-h-52 overflow-y-auto">
                        {filteredClients.map((c) => (
                          <button key={c.id} type="button" onClick={() => selectClient(c)} className="w-full text-left px-3.5 py-2.5 text-sm hover:bg-[#FAFAFA] transition-colors">
                            <p className="text-ink">{c.name}</p>
                            {c.phone && <p className="text-[11px] font-mono text-ink-faint">{c.phone}</p>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {(!clientId || !clients.find((c) => c.id === clientId)?.phone || !clients.find((c) => c.id === clientId)?.email) && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <input value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} placeholder="Numéro WhatsApp" className="border border-black/10 rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all" />
                      <input value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} placeholder="E-mail (optionnel)" className="border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all" />
                    </div>
                  )}

                  {/* Recherche produit + ajout au panier */}
                  <div className="mb-4 p-3.5 bg-[#FAFAFA] rounded-lg border border-black/[0.05]">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-ink-soft">Ajouter un article</p>
                      {user.permissions.canManageProducts && (
                        <button type="button" onClick={() => setQuickAddOpen(true)} className="flex items-center gap-1 text-[11px] font-medium text-brand-600 hover:text-brand-700">
                          <PackagePlus size={12} /> Nouveau produit
                        </button>
                      )}
                    </div>
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
                          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-black/[0.08] rounded-lg shadow-lg overflow-hidden z-10 max-h-52 overflow-y-auto">
                            {filteredProducts.map((p) => (
                              <button key={p.id} type="button" onClick={() => selectProduct(p)} className="w-full text-left px-3.5 py-2.5 text-sm hover:bg-[#FAFAFA] transition-colors">
                                <p className="text-ink truncate">{p.name}</p>
                                <p className="text-[11px] font-mono text-ink-faint">{p.code} — {p.stock} u dispo</p>
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

                  {/* Panier — tous les articles de la vente */}
                  {cart.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-ink-soft mb-1.5">Articles de cette vente ({cart.length})</p>
                      <div className="border border-black/[0.06] rounded-lg overflow-hidden">
                        {cart.map((item) => {
                          const product = pickedProduct.find((p) => p.id === item.productId);
                          if (!product) return null;
                          return (
                            <div key={item.productId} className="flex items-center gap-3 px-3.5 py-2.5 text-sm border-b border-black/[0.05] last:border-0">
                              <span className="flex-1 text-ink truncate">{product.name}</span>
                              <span className="font-mono text-xs text-ink-faint">{item.quantity} x {formatXOF(product.sellingPrice)}</span>
                              <span className="font-mono text-xs font-medium text-ink w-24 text-right">{formatXOF(product.sellingPrice * item.quantity)}</span>
                              <button onClick={() => removeFromCart(item.productId)} className="text-ink-faint hover:text-red-500 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4 px-1">
                    <span className="text-sm font-medium text-ink-soft">Total</span>
                    <span className="text-lg font-semibold text-ink font-mono">{formatXOF(total)}</span>
                  </div>

                  {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

                  <div className="flex gap-2">
                    <button type="button" onClick={handleClose} className="flex-1 border border-black/10 text-ink-soft text-sm font-medium rounded-lg py-2.5 hover:bg-black/[0.02] transition-colors">Annuler</button>
                    <button type="button" onClick={handleSubmit} disabled={isPending || cart.length === 0} className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg py-2.5 transition-colors">
                      {isPending ? "Enregistrement..." : "Valider la vente"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          <QuickAddProductModal open={quickAddOpen} onClose={() => setQuickAddOpen(false)} categories={categories} onCreated={handleProductCreated} />
        </>
      )}
    </AnimatePresence>
  );
}