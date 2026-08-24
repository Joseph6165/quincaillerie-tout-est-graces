import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  Truck,
  Users,
  Settings,
  FileBarChart,
  UserCog,
  LucideIcon,
} from "lucide-react";

export type Role = "ADMIN" | "VENDEUR" | "MAGASINIER";

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrateur",
  VENDEUR: "Vendeur / Caissier",
  MAGASINIER: "Magasinier",
};

export interface Permissions {
  canEditPrices: boolean;
  canManageProducts: boolean;
  canManageStockMovements: boolean;
  canRecordSales: boolean;
  canViewAllSales: boolean;
  canManageSuppliers: boolean;
  canManageClients: boolean;
  canViewReports: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
}

export const PERMISSIONS: Record<Role, Permissions> = {
  ADMIN: {
    canEditPrices: true, canManageProducts: true, canManageStockMovements: true, canRecordSales: true,
    canViewAllSales: true, canManageSuppliers: true, canManageClients: true, canViewReports: true,
    canManageUsers: true, canManageSettings: true,
  },
  VENDEUR: {
    canEditPrices: false, canManageProducts: false, canManageStockMovements: false, canRecordSales: true,
    canViewAllSales: false, canManageSuppliers: false, canManageClients: true, canViewReports: false,
    canManageUsers: false, canManageSettings: false,
  },
    MAGASINIER: {
    canEditPrices: false, canManageProducts: true, canManageStockMovements: true, canRecordSales: false,
    canViewAllSales: false, canManageSuppliers: true, canManageClients: false, canViewReports: false,
    canManageUsers: false, canManageSettings: false,
  },
};

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
  badgeKey?: "lowStock" | "notifications";
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "VENDEUR", "MAGASINIER"] },
  { label: "Gestion des produits", href: "/produits", icon: Package, roles: ["VENDEUR", "MAGASINIER"] },
  { label: "Stock", href: "/stock", icon: Warehouse, roles: ["ADMIN"], badgeKey: "lowStock" },
  { label: "Gestion des stocks", href: "/stock", icon: Warehouse, roles: ["MAGASINIER"], badgeKey: "lowStock" },
  { label: "Ventes", href: "/ventes", icon: ShoppingCart, roles: ["VENDEUR"] },
  { label: "Fournisseurs", href: "/fournisseurs", icon: Truck, roles: ["ADMIN", "MAGASINIER"] },
  { label: "Clients", href: "/clients", icon: Users, roles: ["VENDEUR"] },
  { label: "Rapports", href: "/rapports", icon: FileBarChart, roles: ["ADMIN"] },
  { label: "Utilisateurs", href: "/utilisateurs", icon: UserCog, roles: ["ADMIN"] },
  { label: "Paramètres", href: "/parametres", icon: Settings, roles: ["ADMIN"], badgeKey: "notifications" },
];

export function getNavForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}