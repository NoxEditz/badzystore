import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect, useMemo, useCallback } from "react";

import {
  Package,
  ShoppingBag,
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  Download,
  Edit2,
  Users,
  BarChart2,
  Tag,
  X,
  Save,
  Eye,
  ChevronUp,
  ChevronDown,
  Phone,
  MapPin,
  DollarSign,
} from "lucide-react";
import {
  mapOrderRow,

  type Order,
  type OrderStatus,
  type PaymentStatus,
} from "@/services/orderService";
import { getProducts } from "@/services/productService";
import {
  fetchStoreSettings,
  getStoreSettings,
  updateStoreSettings,
  type StoreSettings,
} from "@/services/settingsService";
import { type Product, CATEGORIES, type Category } from "@/data/products";
import { formatEGP } from "@/lib/currency";
import { toast } from "sonner";
import { mergeCategories } from "@/services/catalogService";
import { useLang } from "@/store/lang";

/* ─────────────────────────────────────── Types ─────────────────────── */
type AdminTab = "orders" | "products" | "categories" | "analytics" | "customers" | "settings";

/* ─────────────────────────────────────── Route ─────────────────────── */
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Badzy Store" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

/* ─────────────────────────────────────── Auth Gate ─────────────────── */
import {
  adminSignIn,
  adminSignOut,
  getAdminStatus,
  saveAdminProduct,
  updateAdminProductStock,
  deleteAdminProduct,
  saveAdminStoreSettings,
  uploadAdminImage,
} from "@/lib/admin.functions";
import { clearAdminOrders, getAdminOrders, updateAdminOrderStatus } from "@/lib/orders.functions";


function AdminPage() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [passkey, setPasskey] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const signIn = useServerFn(adminSignIn);
  const signOut = useServerFn(adminSignOut);
  const status = useServerFn(getAdminStatus);

  useEffect(() => {
    // Migrate legacy client-side flag off the browser; it was never a real check.
    localStorage.removeItem("badzy_admin_auth");
    status()
      .then((s) => setAuthenticated(s.authenticated))
      .catch(() => setAuthenticated(false));
  }, [status]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await signIn({ data: { passkey } });
      if (res.ok) {
        setAuthenticated(true);
        setPasskey("");
        toast.success(isAr ? "مرحباً بك يا أدمن! 🎮" : "Welcome back, Admin! 🎮");
      } else {
        toast.error(isAr ? "كلمة المرور غير صحيحة." : "Invalid passkey.");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : isAr ? "فشل تسجيل الدخول. حاول مرة أخرى." : "Sign-in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      setAuthenticated(false);
    }
  };

  if (authenticated === null) {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16 text-center text-sm text-muted-foreground">
        {isAr ? "جاري التحقق من الجلسة..." : "Checking session…"}
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div dir={isAr ? "rtl" : "ltr"} className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
        <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-2xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-2 ring-primary/20">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {isAr ? "لوحة التحكم" : "Admin Portal"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isAr ? "أدخل كلمة المرور للوصول إلى لوحة تحكم بادزي." : "Enter your passkey to access the Badzy management console."}
          </p>
          <form onSubmit={handleLogin} className="mt-8 space-y-4 text-left" dir={isAr ? "rtl" : "ltr"}>
            <div className="relative">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {isAr ? "كلمة المرور" : "Passkey"}
              </label>
              <input
                type={showPass ? "text" : "password"}
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder={isAr ? "أدخل كلمة المرور" : "Enter admin passkey"}
                autoComplete="current-password"
                className="h-11 w-full rounded-xl border border-border bg-background px-4 pr-11 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className={`absolute top-8 text-muted-foreground hover:text-foreground ${isAr ? "left-3" : "right-3"}`}
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-xl bg-primary text-sm font-bold text-primary-foreground transition hover:brightness-110 active:scale-95 disabled:opacity-60"
            >
              {submitting ? (isAr ? "جاري الدخول..." : "Signing in…") : (isAr ? "دخول" : "Sign In →")}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboard onLogout={handleLogout} />;
}

/* ─────────────────────────────────────── Dashboard ─────────────────── */
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { lang, toggleLang } = useLang();
  const isAr = lang === "ar";
  const [activeTab, setActiveTab] = useState<AdminTab>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(getStoreSettings());
  const [loading, setLoading] = useState(true);

  const fetchOrders = useServerFn(getAdminOrders);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [o, p, s] = await Promise.all([fetchOrders(), getProducts(), fetchStoreSettings()]);
    setOrders(o.orders.map((row) => mapOrderRow(row as never)));
    setProducts(p);
    setSettings(s);
    setLoading(false);
  }, [fetchOrders]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalRevenue = orders.reduce((s, o) => s + o.totalEGP, 0);
  const lowStockCount = products.filter((p) => p.stock < 5).length;
  const pendingCount = orders.filter(
    (o) => o.orderStatus === "placed" || o.paymentStatus === "pending",
  ).length;
  const deliveredCount = orders.filter((o) => o.orderStatus === "delivered").length;

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      id: "orders",
      label: isAr ? "الطلبات" : "Orders",
      icon: <ShoppingBag className="h-4 w-4" />,
      count: orders.length,
    },
    {
      id: "products",
      label: isAr ? "المنتجات" : "Products",
      icon: <Package className="h-4 w-4" />,
      count: products.length,
    },
    { id: "categories", label: isAr ? "الفئات" : "Categories", icon: <Tag className="h-4 w-4" /> },
    { id: "analytics", label: isAr ? "التحليلات" : "Analytics", icon: <BarChart2 className="h-4 w-4" /> },
    { id: "customers", label: isAr ? "العملاء" : "Customers", icon: <Users className="h-4 w-4" /> },
    { id: "settings", label: isAr ? "الإعدادات" : "Settings", icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">Badzy Admin</h1>
              <p className="text-xs text-muted-foreground">{isAr ? "لوحة التحكم والإدارة" : "Management Console"}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground transition hover:bg-secondary"
          >
            {isAr ? "English" : "العربية"}
          </button>
          <button
            onClick={loadData}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground transition hover:bg-secondary"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> {isAr ? "تحديث" : "Refresh"}
          </button>
          <button
            onClick={onLogout}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 text-xs font-semibold text-destructive transition hover:bg-destructive/20"
          >
            <LogOut className="h-3.5 w-3.5" /> {isAr ? "تسجيل الخروج" : "Logout"}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-emerald-400" />}
          label={isAr ? "إجمالي الإيرادات" : "Total Revenue"}
          value={formatEGP(totalRevenue)}
          sub={isAr ? `${orders.length} طلبات` : `${orders.length} orders`}
          color="emerald"
        />
        <StatCard
          icon={<ShoppingBag className="h-5 w-5 text-primary" />}
          label={isAr ? "في الانتظار" : "Pending Action"}
          value={String(pendingCount)}
          sub={isAr ? "تحتاج اهتمام" : "Needs attention"}
          color="red"
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5 text-sky-400" />}
          label={isAr ? "تم التسليم" : "Delivered"}
          value={String(deliveredCount)}
          sub={isAr ? "طلبات مكتملة" : "Completed orders"}
          color="sky"
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5 text-amber-400" />}
          label={isAr ? "مخزون منخفض" : "Low Stock"}
          value={String(lowStockCount)}
          sub={isAr ? "أقل من 5 قطع" : "Under 5 units"}
          color="amber"
        />
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border pb-0 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  activeTab === tab.id
                    ? "bg-primary/15 text-primary"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "orders" && <OrdersTab orders={orders} onRefresh={loadData} />}
      {activeTab === "products" && (
        <ProductsTab products={products} settings={settings} onRefresh={loadData} />
      )}
      {activeTab === "categories" && (
        <CategoriesTab settings={settings} setSettings={setSettings} />
      )}
      {activeTab === "analytics" && <AnalyticsTab orders={orders} products={products} />}
      {activeTab === "customers" && <CustomersTab orders={orders} />}
      {activeTab === "settings" && <SettingsTab settings={settings} setSettings={setSettings} />}
    </div>
  );
}

/* ─────────────────────────────────────── Stat Card ─────────────────── */
function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div
      className={`rounded-xl border border-border/60 bg-card p-5 transition hover:border-border`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {icon}
      </div>
      <p className="mt-3 font-display text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

/* ─────────────────────────────────────── Orders Tab ────────────────── */
function OrdersTab({ orders, onRefresh }: { orders: Order[]; onRefresh: () => void }) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [clearingOrders, setClearingOrders] = useState(false);
  const clearOrders = useServerFn(clearAdminOrders);

  const filtered = useMemo(() => {
    let list =
      filter === "all"
        ? orders
        : orders.filter((o) => o.orderStatus === filter || o.paymentStatus === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.customerName?.toLowerCase().includes(q) ||
          o.phone?.includes(q) ||
          o.orderNumber?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [orders, filter, search]);

  const exportCSV = () => {
    const header = [
      "Order#",
      "Customer",
      "Phone",
      "City",
      "Governorate",
      "Total",
      "Status",
      "Payment",
      "Date",
    ];
    const rows = filtered.map((o) => [
      o.orderNumber,
      o.customerName,
      o.phone,
      o.city,
      o.governorate,
      o.totalEGP,
      o.orderStatus,
      o.paymentStatus,
      new Date(o.createdAt).toLocaleDateString(),
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "badzy-orders.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(isAr ? "تم تصدير الطلبات كملف CSV!" : "Orders exported as CSV!");
  };

  const handleClearOrders = async () => {
    if (orders.length === 0 || clearingOrders) return;

    const confirmed = window.confirm(
      isAr
        ? `سيتم حذف ${orders.length} طلب نهائياً من قاعدة البيانات. هل تريد الاستمرار؟`
        : `This will permanently delete ${orders.length} order${orders.length === 1 ? "" : "s"} from Supabase. Continue?`,
    );
    if (!confirmed) return;

    setClearingOrders(true);
    try {
      const result = await clearOrders();
      toast.success(isAr ? `تم حذف ${result.deletedCount} طلب.` : `Deleted ${result.deletedCount} order${result.deletedCount === 1 ? "" : "s"}.`);
      setFilter("all");
      setSearch("");
      onRefresh();
    } catch (error: unknown) {
      toast.error(
        `Clear failed: ${error instanceof Error ? error.message : "Supabase rejected the delete request"}`,
      );
    } finally {
      setClearingOrders(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground ${isAr ? "right-3" : "left-3"}`} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? "البحث بالاسم / الهاتف / رقم الطلب..." : "Search name / phone..."}
              className={`h-9 rounded-lg border border-border bg-background text-xs outline-none focus:border-primary ${isAr ? "pr-9 pl-3" : "pl-9 pr-3"}`}
            />
          </div>
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-9 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary"
          >
            <option value="all">{isAr ? "جميع الطلبات" : "All Orders"}</option>
            <option value="placed">{isAr ? "الحالة: تم الطلب" : "Status: Placed"}</option>
            <option value="confirmed">{isAr ? "الحالة: تم التأكيد" : "Status: Confirmed"}</option>
            <option value="shipped">{isAr ? "الحالة: تم الشحن" : "Status: Shipped"}</option>
            <option value="delivered">{isAr ? "الحالة: تم التسليم" : "Status: Delivered"}</option>
            <option value="cancelled">{isAr ? "الحالة: ملغي" : "Status: Cancelled"}</option>
            <option value="pending">{isAr ? "الدفع: معلق" : "Payment: Pending"}</option>
            <option value="cod">{isAr ? "الدفع: عند الاستلام" : "Payment: COD"}</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{isAr ? `${filtered.length} طلبات` : `${filtered.length} orders`}</span>
          <button
            onClick={exportCSV}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-semibold transition hover:bg-secondary"
          >
            <Download className="h-3.5 w-3.5" /> {isAr ? "تصدير CSV" : "Export CSV"}
          </button>
          <button
            onClick={handleClearOrders}
            disabled={orders.length === 0 || clearingOrders}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 text-xs font-semibold text-destructive transition hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> {clearingOrders ? (isAr ? "جاري الحذف..." : "Clearing...") : (isAr ? "حذف الطلبات" : "Clear Orders")}
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message={isAr ? "لا توجد طلبات تطابق الفلتر الحالي." : "No orders match the current filter."} />
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <OrderCard key={o.id} order={o} onRefresh={onRefresh} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order: o, onRefresh }: { order: Order; onRefresh: () => void }) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [expanded, setExpanded] = useState(false);
  const setOrderStatus = useServerFn(updateAdminOrderStatus);

  const orderStatusLabels: Record<string, string> = {
    placed: isAr ? "تم الطلب" : "placed",
    confirmed: isAr ? "تم التأكيد" : "confirmed",
    shipped: isAr ? "تم الشحن" : "shipped",
    delivered: isAr ? "تم التسليم" : "delivered",
    cancelled: isAr ? "ملغي" : "cancelled",
  };

  const statusColors: Record<string, string> = {
    placed: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    shipped: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    delivered: "bg-green-500/10 text-green-400 border-green-500/30",
    cancelled: "bg-destructive/10 text-destructive border-destructive/30",
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden transition hover:border-border">
      {/* Order header row */}
      <div
        className="flex flex-wrap cursor-pointer items-center justify-between gap-3 p-4"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-primary">{o.orderNumber}</span>
              <span
                className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${statusColors[o.orderStatus] ?? ""}`}
              >
                {orderStatusLabels[o.orderStatus] || o.orderStatus}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              <strong className="text-foreground">{o.customerName}</strong> · {o.phone} · {o.city},{" "}
              {o.governorate}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-primary">{formatEGP(o.totalEGP)}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(o.createdAt).toLocaleDateString()}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-border/40 p-4 space-y-4">
          {/* Status controls */}
          <div className="flex flex-wrap gap-2">
            <select
              value={o.orderStatus}
              onClick={(e) => e.stopPropagation()}
              onChange={async (e) => {
                await setOrderStatus({
                  data: { id: o.id, orderStatus: e.target.value as OrderStatus },
                });

                toast.success(`Order ${o.orderNumber} → ${e.target.value}`);
                onRefresh();
              }}
              className="h-8 rounded-lg border border-primary/40 bg-primary/10 px-2 text-xs font-semibold text-primary outline-none"
            >
              <option value="placed">{isAr ? "تم الطلب" : "Placed"}</option>
              <option value="confirmed">{isAr ? "تم التأكيد" : "Confirmed"}</option>
              <option value="shipped">{isAr ? "تم الشحن" : "Shipped"}</option>
              <option value="delivered">{isAr ? "تم التسليم" : "Delivered"}</option>
              <option value="cancelled">{isAr ? "ملغي" : "Cancelled"}</option>
            </select>
            <select
              value={o.paymentStatus}
              onClick={(e) => e.stopPropagation()}
              onChange={async (e) => {
                await setOrderStatus({
                  data: {
                    id: o.id,
                    orderStatus: o.orderStatus,
                    paymentStatus: e.target.value as PaymentStatus,
                  },
                });

                toast.success(`Payment → ${e.target.value}`);
                onRefresh();
              }}
              className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-semibold outline-none"
            >
              <option value="pending">{isAr ? "معلق" : "Pending"}</option>
              <option value="verified">{isAr ? "تم التحقق" : "Verified"}</option>
              <option value="paid">{isAr ? "مدفوع" : "Paid"}</option>
              <option value="failed">{isAr ? "فشل" : "Failed"}</option>
              <option value="cod">{isAr ? "دفع عند الاستلام" : "COD"}</option>
            </select>
            {o.paymentReference && (
              <span className="flex h-8 items-center rounded-lg bg-primary/10 px-2 font-mono text-[11px] text-primary">
                Ref: {o.paymentReference}
              </span>
            )}
          </div>

          {/* Items */}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {o.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/60 p-2.5 text-xs"
              >
                <img
                  src={item.image}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-lg object-cover bg-black"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{item.name}</p>
                  <p className="text-muted-foreground">
                    Qty {item.qty} × {formatEGP(item.priceEGP)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Address */}
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Address:</span> {o.street}
            {o.landmark ? `, ${o.landmark}` : ""}, {o.city}, {o.governorate}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────── Products Tab ──────────────── */
function ProductsTab({
  products,
  settings,
  onRefresh,
}: {
  products: Product[];
  settings: StoreSettings;
  onRefresh: () => void;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState("");
  const updateStock = useServerFn(updateAdminProductStock);
  const removeProduct = useServerFn(deleteAdminProduct);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.category.includes(q));
  }, [products, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground ${isAr ? "right-3" : "left-3"}`} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? "البحث عن منتج..." : "Search products..."}
            className={`h-9 rounded-lg border border-border bg-background text-xs outline-none focus:border-primary ${isAr ? "pr-9 pl-3" : "pl-9 pr-3"}`}
          />
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingProduct(null);
          }}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground transition hover:brightness-110"
        >
          <Plus className="h-3.5 w-3.5" /> {isAr ? "إضافة منتج" : "Add Product"}
        </button>
      </div>

      {(showAddForm || editingProduct) && (
        <ProductForm
          product={editingProduct ?? undefined}
          settings={settings}
          onSaved={() => {
            setShowAddForm(false);
            setEditingProduct(null);
            onRefresh();
          }}
          onCancel={() => {
            setShowAddForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="flex flex-col justify-between rounded-xl border border-border/60 bg-card p-4 transition hover:border-border"
          >
            <div className="flex gap-3">
              <img
                src={p.image}
                alt={p.name}
                className="h-16 w-16 shrink-0 rounded-lg object-cover bg-black"
              />
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-semibold">{p.name}</h4>
                {p.nameAr && <p className="truncate text-xs text-muted-foreground">{p.nameAr}</p>}
                <p className="mt-1 font-display font-bold text-primary text-sm">
                  {formatEGP(p.price)}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {p.category}
                </p>
              </div>
            </div>

            <div className="mt-3 border-t border-border/40 pt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Stock:</span>
                <input
                  type="number"
                  min={0}
                  defaultValue={p.stock}
                  onBlur={async (e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      try {
                        await updateStock({ data: { id: p.id, stock: val } });
                        toast.success(`Stock updated for ${p.name}`);
                        onRefresh();
                      } catch (error) {
                        toast.error(
                          `Stock update failed: ${error instanceof Error ? error.message : "Supabase rejected the change"}`,
                        );
                      }
                    }
                  }}
                  className="h-7 w-16 rounded-lg border border-border bg-background px-2 text-center text-xs font-bold outline-none focus:border-primary"
                />
                {p.stock === 0 && (
                  <span className="rounded bg-destructive/20 px-1.5 py-0.5 text-[10px] font-bold text-destructive">
                    OUT
                  </span>
                )}
                {p.stock > 0 && p.stock < 5 && (
                  <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                    LOW
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingProduct(p);
                    setShowAddForm(false);
                  }}
                  className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={async () => {
                    if (confirm(`Delete "${p.name}"?`)) {
                      try {
                        await removeProduct({ data: { id: p.id } });
                        toast.success("Product deleted");
                        onRefresh();
                      } catch (error) {
                        toast.error(
                          `Delete failed: ${error instanceof Error ? error.message : "Supabase rejected the change"}`,
                        );
                      }
                    }
                  }}
                  className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────── Product Form ──────────────── */
function ProductForm({
  product,
  settings,
  onSaved,
  onCancel,
}: {
  product?: Product;
  settings: StoreSettings;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const allCategories = mergeCategories(settings);
  const [name, setName] = useState(product?.name ?? "");
  const [nameAr, setNameAr] = useState(product?.nameAr ?? "");
  const [category, setCategory] = useState<string>(product?.category ?? "mice");
  const [price, setPrice] = useState(product?.price ?? 1000);
  const [oldPrice, setOldPrice] = useState(product?.oldPrice ?? 0);
  const [stock, setStock] = useState(product?.stock ?? 10);
  const [image, setImage] = useState(product?.image ?? "");
  const [images, setImages] = useState((product?.images ?? [product?.image ?? ""]).filter(Boolean).join(", "));
  const [desc, setDesc] = useState(product?.shortDesc ?? "");
  const [descAr, setDescAr] = useState(product?.shortDescAr ?? "");
  const [badge, setBadge] = useState(product?.badge ?? "");
  const [badgeColor, setBadgeColor] = useState(product?.badgeColor ?? "#7c3aed");
  const [badgeTextColor, setBadgeTextColor] = useState(product?.badgeTextColor ?? "#ffffff");
  const [badgeStyle, setBadgeStyle] = useState<Product["badgeStyle"]>(product?.badgeStyle ?? "solid");
  const [tags, setTags] = useState(
    (product?.tags?.length ? product.tags : [product?.category ?? "mice"]).join(", "),
  );
  const [specs, setSpecs] = useState<{ label: string; value: string }[]>(
    product?.specs ?? [],
  );
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedTags = Array.from(
      new Set(
        tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      ),
    );
    const p: Product = {
      id: product?.id ?? `prod_${Date.now()}`,
      slug: product?.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name,
      nameAr,
      category: category as Category,
      price: Number(price),
      oldPrice: oldPrice > 0 ? Number(oldPrice) : undefined,
      rating: product?.rating ?? 5.0,
      reviews: product?.reviews ?? 0,
      image: image || "",
      images: Array.from(
        new Set(
          images
            .split(",")
            .map((url) => url.trim())
            .filter(Boolean),
        ),
      ),
      shortDesc: desc || "Gaming accessory",
      shortDescAr: descAr || undefined,
      specs: specs
        .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
        .filter((s) => s.label && s.value),
      stock: Number(stock),
      tags: normalizedTags.length ? normalizedTags : [category],
      badge: badge.trim() || undefined,
      badgeColor: badge.trim() ? badgeColor : undefined,
      badgeTextColor: badge.trim() ? badgeTextColor : undefined,
      badgeStyle: badge.trim() ? badgeStyle : undefined,
    };
    try {
      await saveAdminProduct({ data: { product: p } });
      toast.success(product ? "Product updated!" : "Product added!");
      onSaved();
    } catch (error) {
      toast.error(
        `Product save failed: ${error instanceof Error ? error.message : "Supabase rejected the change"}`,
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-primary/30 bg-card p-5 space-y-4 text-sm"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold">
          {product ? (isAr ? "تعديل منتج" : "Edit Product") : (isAr ? "منتج جديد" : "New Product")}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={isAr ? "الاسم (بالانجليزية)" : "Name (EN)"} required>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="admin-input"
          />
        </Field>
        <Field label={isAr ? "الاسم (بالعربية)" : "Name (AR)"}>
          <input
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            dir="rtl"
            className="admin-input"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={isAr ? "القسم" : "Category"} required>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="admin-input"
          >
            {allCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={isAr ? "السعر (ج.م)" : "Price (EGP)"} required>
          <input
            type="number"
            required
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="admin-input"
          />
        </Field>
        <Field label={isAr ? "السعر القديم (ج.م)" : "Old Price (EGP)"}>
          <input
            type="number"
            value={oldPrice}
            onChange={(e) => setOldPrice(Number(e.target.value))}
            className="admin-input"
            placeholder="0 = none"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={isAr ? "المخزون" : "Stock"}>
          <input
            type="number"
            required
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            className="admin-input"
          />
        </Field>
        <Field label={isAr ? "رابط الصورة" : "Image URL"}>
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                try {
                  const res = await uploadAdminImage({ data: { file: await file.arrayBuffer(), filename: file.name, contentType: file.type } });
                  const url = res.url;
                  setImage(url);
                  setImages((prev) => (prev ? `${url}, ${prev}` : url));
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Upload failed");
                } finally {
                  setUploading(false);
                }
              }}
              disabled={uploading}
              className="text-xs file:mr-2 file:rounded-md file:border-0 file:bg-primary/10 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
            />
            {uploading && <span className="text-xs text-muted-foreground">Uploading…</span>}
            <input
              value={image}
              readOnly
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className="admin-input opacity-60"
            />
          </div>
        </Field>
        <Field label={isAr ? "صور المعرض (مفصولة بفاصلة)" : "Gallery Images (comma separated)"}>
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                try {
                  const res = await uploadAdminImage({ data: { file: await file.arrayBuffer(), filename: file.name, contentType: file.type } });
                  const url = res.url;
                  setImages((prev) => (prev ? `${prev}, ${url}` : url));
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Upload failed");
                } finally {
                  setUploading(false);
                }
              }}
              disabled={uploading}
              className="text-xs file:mr-2 file:rounded-md file:border-0 file:bg-primary/10 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
            />
            <input
              value={images}
              onChange={(e) => setImages(e.target.value)}
              placeholder="https://... , https://..."
              className="admin-input"
            />
          </div>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={isAr ? "الوصف (بالانجليزية)" : "Description (EN)"}>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="admin-input !h-20 resize-none"
          />
        </Field>
        <Field label={isAr ? "الوصف (بالعربية)" : "Description (AR)"}>
          <textarea
            value={descAr}
            onChange={(e) => setDescAr(e.target.value)}
            dir="rtl"
            className="admin-input !h-20 resize-none"
          />
        </Field>
      </div>

      <div className="space-y-3 rounded-xl border border-border/60 bg-background/40 p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold">
            {isAr ? "المواصفات الفنية" : "Technical Specifications"}
          </h4>
          <button
            type="button"
            onClick={() => setSpecs((prev) => [...prev, { label: "", value: "" }])}
            className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-[11px] font-semibold transition hover:bg-secondary"
          >
            <Plus className="h-3 w-3" /> {isAr ? "إضافة مواصفة" : "Add Spec"}
          </button>
        </div>
        {specs.length === 0 && (
          <p className="text-xs text-muted-foreground">
            {isAr ? "لا توجد مواصفات. اضغط \"إضافة مواصفة\" للبدء." : "No specs yet. Click \"Add Spec\" to start."}
          </p>
        )}
        <div className="space-y-2">
          {specs.map((spec, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                value={spec.label}
                onChange={(e) => {
                  const label = e.target.value;
                  setSpecs((prev) => prev.map((s, i) => (i === idx ? { ...s, label } : s)));
                }}
                placeholder={isAr ? "المواصفة (مثال: المعالج)" : "Label (e.g. Sensor)"}
                className="admin-input flex-1"
              />
              <input
                value={spec.value}
                onChange={(e) => {
                  const value = e.target.value;
                  setSpecs((prev) => prev.map((s, i) => (i === idx ? { ...s, value } : s)));
                }}
                placeholder={isAr ? "القيمة (مثال: 26K DPI)" : "Value (e.g. 26K DPI)"}
                className="admin-input flex-1"
              />
              <button
                type="button"
                onClick={() => setSpecs((prev) => prev.filter((_, i) => i !== idx))}
                className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSpecs((prev) => [...prev, { label: "", value: "" }])}
            className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-[11px] font-semibold transition hover:bg-secondary"
          >
            <Plus className="h-3 w-3" /> {isAr ? "إضافة مواصفة" : "Add Spec"}
          </button>
          {specs.length > 0 && (
            <button
              type="button"
              onClick={() => setSpecs([])}
              className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-destructive/40 bg-destructive/10 px-2.5 text-[11px] font-semibold text-destructive transition hover:bg-destructive/20"
            >
              <Trash2 className="h-3 w-3" /> {isAr ? "مسح الكل" : "Clear All"}
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={isAr ? "شارة مخصصة" : "Manual Badge / Label"}>
          <input
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            className="admin-input"
            placeholder="New, Best seller, Low stock, -20%..."
          />
          <p className="mt-1 text-[10px] text-muted-foreground">
            Leave blank to allow automatic labels from discount, stock, and tags.
          </p>
        </Field>
        <Field label={isAr ? "نمط الشارة" : "Badge Style"}>
          <select value={badgeStyle} onChange={(e) => setBadgeStyle(e.target.value as Product["badgeStyle"])} className="admin-input">
            <option value="solid">Solid</option>
            <option value="outline">Outline</option>
            <option value="glow">Glow</option>
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={isAr ? "لون الشارة" : "Badge Color"}>
          <input type="color" value={badgeColor} onChange={(e) => setBadgeColor(e.target.value)} className="admin-input h-11 p-1" />
        </Field>
        <Field label={isAr ? "لون نص الشارة" : "Badge Text Color"}>
          <input type="color" value={badgeTextColor} onChange={(e) => setBadgeTextColor(e.target.value)} className="admin-input h-11 p-1" />
        </Field>
        <Field label={isAr ? "الكلمات المفتاحية (مفصولة بفاصلة)" : "Tags (comma separated)"}>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="admin-input"
            placeholder="new, best-seller, wireless, rgb"
          />
          <p className="mt-1 text-[10px] text-muted-foreground">
            Use tags like new, best-seller, low-stock, wireless, rgb for search and labels.
          </p>
        </Field>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground transition hover:brightness-110"
        >
          <Save className="h-3.5 w-3.5" /> {product ? (isAr ? "حفظ التغييرات" : "Save Changes") : (isAr ? "إضافة منتج" : "Add Product")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-9 rounded-lg border border-border px-4 text-xs font-semibold transition hover:bg-secondary"
        >
          {isAr ? "إلغاء" : "Cancel"}
        </button>
      </div>
    </form>
  );
}

/* ─────────────────────────────────────── Categories Tab ────────────── */
function CategoriesTab({
  settings,
  setSettings,
}: {
  settings: StoreSettings;
  setSettings: (s: StoreSettings) => void;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const builtIn = CATEGORIES;
  const [label, setLabel] = useState("");
  const [labelAr, setLabelAr] = useState("");
  const [emoji, setEmoji] = useState("");
  const [image, setImage] = useState("");
  const [visible, setVisible] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const saveSettings = useServerFn(saveAdminStoreSettings);

  const persistCategories = async (customCategories: StoreSettings["customCategories"]) => {
    const nextSettings = { ...settings, customCategories };
    setSaving(true);
    try {
      const res = await saveSettings({ data: { settings: nextSettings } });
      updateStoreSettings(res.settings);
      window.dispatchEvent(new CustomEvent("badzy:store-settings-updated", { detail: res.settings }));
      setSettings(res.settings);
      toast.success("Categories saved to Supabase!");
    } catch (error) {
      toast.error(
        `Category save failed: ${error instanceof Error ? error.message : "Please try again"}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    const newCat = {
      id: editingId || label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      label: label.trim(),
      labelAr: labelAr.trim() || label.trim(),
      emoji: emoji.trim() || undefined,
      image: image.trim() || undefined,
      visible,
      sortOrder: Number(sortOrder) || 0,
    };
    const updated = [...settings.customCategories.filter((c) => c.id !== newCat.id), newCat];
    await persistCategories(updated);
    setLabel("");
    setLabelAr("");
    setEmoji("");
    setImage("");
    setVisible(true);
    setSortOrder(0);
    setEditingId(null);
  };

  const editCategory = (category: StoreSettings["customCategories"][number]) => {
    setEditingId(category.id);
    setLabel(category.label);
    setLabelAr(category.labelAr);
    setEmoji(category.emoji ?? "");
    setImage(category.image ?? "");
    setVisible(category.visible !== false);
    setSortOrder(category.sortOrder ?? 0);
  };

  const editBuiltIn = (category: (typeof builtIn)[number]) => {
    editCategory({
      id: category.id,
      label: category.label,
      labelAr: category.labelAr,
      emoji: category.emoji,
      image: category.image,
      visible: category.visible,
      sortOrder: category.sortOrder,
    });
  };

  const deleteCustom = async (id: string) => {
    const updated = settings.customCategories.filter((c) => c.id !== id);
    await persistCategories(updated);
  };

  const editCustom = (category: StoreSettings["customCategories"][number]) => {
    editCategory(category);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="font-display text-lg font-bold mb-4">{isAr ? "الأقسام الأساسية" : "Built-in Categories"}</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {builtIn.map((c) => {
            const override = settings.customCategories.find((custom) => custom.id === c.id);
            const displayLabel = override?.label || c.label;
            const displayLabelAr = override?.labelAr || c.labelAr;
            const displayEmoji = override?.emoji || c.emoji;
            const isHidden = override ? override.visible === false : c.visible === false;
            
            return (
              <div
                key={c.id}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                  isHidden ? "border-border/40 bg-card/50 opacity-60" : "border-border/60 bg-card"
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    {displayLabel}
                    {isHidden && (
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                        {isAr ? "مخفي" : "Hidden"}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{displayLabelAr}</p>
                  {displayEmoji && <p className="text-xs">{displayEmoji}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => editBuiltIn(override || c)}
                  className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase text-primary transition hover:bg-primary/20"
                >
                  {isAr ? "تعديل" : "Edit"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg font-bold mb-4">{isAr ? "الأقسام المخصصة" : "Custom Categories"}</h3>
        {settings.customCategories.filter((c) => !builtIn.some((b) => b.id === c.id)).length === 0 ? (
          <p className="text-sm text-muted-foreground">{isAr ? "لا توجد أقسام مخصصة بعد. أضف واحداً بالأسفل." : "No custom categories yet. Add one below."}</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 mb-4">
            {settings.customCategories
              .filter((c) => !builtIn.some((b) => b.id === c.id))
              .map((c) => {
                const isHidden = c.visible === false;
                return (
                  <div
                    key={c.id}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                      isHidden ? "border-primary/20 bg-card/50 opacity-60" : "border-primary/30 bg-card"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold flex items-center gap-2">
                        {c.label}
                        {isHidden && (
                          <span className="text-[9px] uppercase tracking-wider text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                            {isAr ? "مخفي" : "Hidden"}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{c.labelAr}</p>
                      {c.emoji && <p className="text-xs">{c.emoji}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => editCustom(c)}
                        className="text-muted-foreground hover:text-primary transition disabled:opacity-50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => deleteCustom(c.id)}
                        className="text-muted-foreground hover:text-destructive transition disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        <form
          onSubmit={addCategory}
          className="rounded-xl border border-border/60 bg-card p-5 space-y-3"
        >
          <h4 className="text-sm font-bold">
            {editingId 
              ? (isAr ? "تعديل القسم" : "Edit Category") 
              : (isAr ? "إضافة قسم جديد" : "Add New Category")}
          </h4>
          {editingId && builtIn.some((b) => b.id === editingId) && (
            <p className="text-xs text-muted-foreground -mt-1">
              {isAr 
                ? "تعديل قسم أساسي - سيتم تخصيص الإعدادات وحفظها في قاعدة البيانات" 
                : "Editing built-in category - customizations will be saved to database"}
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={isAr ? "الاسم (بالانجليزية)" : "Label (EN)"} required>
              <input
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Controllers"
                className="admin-input"
              />
            </Field>
            <Field label={isAr ? "الاسم (بالعربية)" : "Label (AR)"}>
              <input
                value={labelAr}
                onChange={(e) => setLabelAr(e.target.value)}
                dir="rtl"
                placeholder="مثال: أذرع تحكم"
                className="admin-input"
              />
            </Field>
            <Field label={isAr ? "رمز تعبيري (Emoji)" : "Emoji (Optional)"}>
              <input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="🖱️" className="admin-input" />
            </Field>
            <Field label={isAr ? "رابط الصورة" : "Image URL"}>
              <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." className="admin-input" />
            </Field>
            <Field label="Sort Order">
              <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="admin-input" />
            </Field>
            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} /> Visible in storefront
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
            >
              {editingId ? <Save className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              {saving ? (isAr ? "جاري الحفظ..." : "Saving…") : editingId ? (isAr ? "تحديث" : "Update") : (isAr ? "إضافة" : "Add")}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setLabel("");
                  setLabelAr("");
                  setEmoji("");
                  setImage("");
                  setVisible(true);
                  setSortOrder(0);
                }}
                className="h-9 rounded-lg border border-border px-4 text-xs font-semibold transition hover:bg-secondary"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────── Analytics Tab ─────────────── */
function AnalyticsTab({ orders, products }: { orders: Order[]; products: Product[] }) {
  const totalRevenue = orders.reduce((s, o) => s + o.totalEGP, 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  // Top 5 products by order frequency
  const productFrequency: Record<string, { name: string; count: number; revenue: number }> = {};
  for (const order of orders) {
    for (const item of order.items) {
      if (!productFrequency[item.name])
        productFrequency[item.name] = { name: item.name, count: 0, revenue: 0 };
      productFrequency[item.name].count += item.qty;
      productFrequency[item.name].revenue += item.qty * item.priceEGP;
    }
  }
  const topProducts = Object.values(productFrequency)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Order status breakdown
  const statusBreakdown = [
    {
      label: "Placed",
      count: orders.filter((o) => o.orderStatus === "placed").length,
      color: "bg-blue-400",
    },
    {
      label: "Confirmed",
      count: orders.filter((o) => o.orderStatus === "confirmed").length,
      color: "bg-emerald-400",
    },
    {
      label: "Shipped",
      count: orders.filter((o) => o.orderStatus === "shipped").length,
      color: "bg-amber-400",
    },
    {
      label: "Delivered",
      count: orders.filter((o) => o.orderStatus === "delivered").length,
      color: "bg-green-400",
    },
    {
      label: "Cancelled",
      count: orders.filter((o) => o.orderStatus === "cancelled").length,
      color: "bg-red-400",
    },
  ];

  // Payment breakdown
  const paymentBreakdown = [
    { label: "COD", count: orders.filter((o) => o.paymentMethod === "cod").length },
    { label: "Wallet", count: orders.filter((o) => o.paymentMethod === "wallet").length },
    { label: "Card", count: orders.filter((o) => o.paymentMethod === "card").length },
    { label: "Fawry", count: orders.filter((o) => o.paymentMethod === "fawry").length },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Avg Order Value
          </p>
          <p className="mt-2 font-display text-2xl font-bold">{formatEGP(avgOrderValue)}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Orders
          </p>
          <p className="mt-2 font-display text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Products Listed
          </p>
          <p className="mt-2 font-display text-2xl font-bold">{products.length}</p>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <h3 className="mb-4 font-display text-base font-bold">Order Status Breakdown</h3>
        <div className="space-y-3">
          {statusBreakdown.map((s) => {
            const pct = orders.length > 0 ? (s.count / orders.length) * 100 : 0;
            return (
              <div key={s.label} className="flex items-center gap-3 text-sm">
                <span className="w-20 shrink-0 text-xs text-muted-foreground">{s.label}</span>
                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${s.color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs font-bold">{s.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment methods */}
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <h3 className="mb-4 font-display text-base font-bold">Payment Methods</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {paymentBreakdown.map((p) => (
            <div
              key={p.label}
              className="rounded-lg border border-border/40 bg-background/60 p-3 text-center"
            >
              <p className="font-display text-2xl font-bold">{p.count}</p>
              <p className="mt-1 text-xs text-muted-foreground">{p.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <h3 className="mb-4 font-display text-base font-bold">Top Products by Sales</h3>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <span className="flex-1 truncate">{p.name}</span>
                <span className="text-xs text-muted-foreground">{p.count} sold</span>
                <span className="font-bold text-primary">{formatEGP(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 && (
        <EmptyState message="No order data yet. Orders will appear here once placed." />
      )}
    </div>
  );
}

/* ─────────────────────────────────────── Customers Tab ─────────────── */
function CustomersTab({ orders }: { orders: Order[] }) {
  const [search, setSearch] = useState("");

  // Deduplicate by phone
  const customers = useMemo(() => {
    const map: Record<
      string,
      {
        name: string;
        phone: string;
        city: string;
        governorate: string;
        orders: number;
        spent: number;
      }
    > = {};
    for (const o of orders) {
      if (!map[o.phone]) {
        map[o.phone] = {
          name: o.customerName,
          phone: o.phone,
          city: o.city,
          governorate: o.governorate,
          orders: 0,
          spent: 0,
        };
      }
      map[o.phone].orders++;
      map[o.phone].spent += o.totalEGP;
    }
    return Object.values(map).sort((a, b) => b.spent - a.spent);
  }, [orders]);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q));
  }, [customers, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="h-9 rounded-lg border border-border bg-background pl-9 pr-3 text-xs outline-none focus:border-primary"
          />
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} unique customers</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No customers yet. Orders will populate this list." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div key={c.phone} className="rounded-xl border border-border/60 bg-card p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm">{c.name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Phone className="h-3 w-3" /> {c.phone}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {c.city}, {c.governorate}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display font-bold text-primary text-sm">
                    {formatEGP(c.spent)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.orders} order{c.orders !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────── Settings Tab ──────────────── */
function SettingsTab({
  settings,
  setSettings,
}: {
  settings: StoreSettings;
  setSettings: (s: StoreSettings) => void;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const saveSettings = useServerFn(saveAdminStoreSettings);

  const updateAnnouncementItem = (id: string, changes: Partial<StoreSettings["announcementItems"][number]>) => {
    setSettings({
      ...settings,
      announcementItems: settings.announcementItems.map((item) =>
        item.id === id ? { ...item, ...changes } : item,
      ),
    });
  };

  useEffect(() => {
    let cancelled = false;
    setLoadingSettings(true);
    fetchStoreSettings()
      .then((liveSettings) => {
        if (!cancelled) setSettings(liveSettings);
      })
      .catch((error) => {
        console.error("Failed to load store settings", error);
        toast.error("Could not load live settings. Showing cached defaults.");
      })
      .finally(() => {
        if (!cancelled) setLoadingSettings(false);
      });

    return () => {
      cancelled = true;
    };
  }, [setSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await saveSettings({ data: { settings } });
      updateStoreSettings(res.settings);
      window.dispatchEvent(new CustomEvent("badzy:store-settings-updated", { detail: res.settings }));
      toast.success("Settings saved to Supabase!");
    } catch (error) {
      console.error("Failed to save store settings", error);
      const message = error instanceof Error ? error.message : "Please try again.";
      toast.error(`Failed to save settings: ${message}`);
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <form
        onSubmit={handleSave}
        className="rounded-xl border border-border/60 bg-card p-6 space-y-5"
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-bold">{isAr ? "إعدادات المتجر" : "Store Configuration"}</h3>
          {loadingSettings && (
            <span className="text-xs text-muted-foreground">{isAr ? "جاري تحميل الإعدادات المباشرة…" : "Loading live settings…"}</span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={isAr ? "حد الشحن المجاني (جنيه)" : "Free Shipping Threshold (EGP)"}>
            <input
              type="number"
              value={settings.freeShippingThresholdEGP}
              onChange={(e) =>
                setSettings({ ...settings, freeShippingThresholdEGP: Number(e.target.value) })
              }
              className="admin-input"
            />
          </Field>
          <Field label={isAr ? "رسوم الشحن الافتراضية (جنيه)" : "Default Shipping Fee (EGP)"}>
            <input
              type="number"
              value={settings.defaultShippingFeeEGP}
              onChange={(e) =>
                setSettings({ ...settings, defaultShippingFeeEGP: Number(e.target.value) })
              }
              className="admin-input"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={isAr ? "حد المخزون المنخفض" : "Low Stock Threshold"}>
            <input
              type="number"
              min={1}
              value={settings.lowStockThreshold}
              onChange={(e) =>
                setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })
              }
              className="admin-input"
            />
          </Field>
          <Field label={isAr ? "رؤية الإعلان" : "Announcement Visibility"}>
            <div className="rounded-xl border border-border/60 bg-background px-3 py-2 text-xs text-muted-foreground">
              {isAr ? "تفعيل الشريط العلوي لعرض رسائل الشحن أو العروض في كل الموقع." : "Enable the top banner to show shipping or promo messaging across the site."}
            </div>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={isAr ? "رقم واتساب (+20...)" : "WhatsApp Number (+20...)"}>
            <input
              type="text"
              value={settings.whatsappNumber}
              onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
              className="admin-input"
            />
          </Field>
          <Field label={isAr ? "معرف إنستاباي" : "InstaPay Handle"}>
            <input
              type="text"
              value={settings.instapayHandle}
              onChange={(e) => setSettings({ ...settings, instapayHandle: e.target.value })}
              className="admin-input"
            />
          </Field>
          <Field label={isAr ? "البريد الإلكتروني للدعم" : "Support Email"}>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              className="admin-input"
            />
          </Field>
        </div>

        <div className="border-t border-border/60 pt-5 mt-5">
          <h4 className="font-display text-md font-bold mb-4">{isAr ? "شريط الإعلانات العلوي" : "Top Announcement Banner"}</h4>

          <label className="flex items-center gap-3 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.announcementEnabled}
              onChange={(e) => setSettings({ ...settings, announcementEnabled: e.target.checked })}
              className="accent-primary h-4 w-4"
            />
            <span className="text-sm font-semibold">{isAr ? "تفعيل شريط الإعلانات" : "Enable Announcement Banner"}</span>
          </label>

          {settings.announcementEnabled && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={isAr ? "نص الإعلان (انجليزي)" : "Banner Text (EN)"}>
                <input
                  type="text"
                  value={settings.announcementTextEn}
                  onChange={(e) => setSettings({ ...settings, announcementTextEn: e.target.value })}
                  placeholder="e.g. Free shipping!"
                  className="admin-input"
                />
              </Field>
              <Field label={isAr ? "نص الإعلان (عربي)" : "Banner Text (AR)"}>
                <input
                  type="text"
                  value={settings.announcementTextAr}
                  onChange={(e) => setSettings({ ...settings, announcementTextAr: e.target.value })}
                  dir="rtl"
                  placeholder="مثال: شحن مجاني!"
                  className="admin-input"
                />
              </Field>
            </div>
          )}
        </div>

        <div className="border-t border-border/60 pt-5 mt-5 space-y-4">
          <h4 className="font-display text-md font-bold">Homepage Hero Content</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Hero Tag (EN)">
              <input
                type="text"
                value={settings.heroTagEn}
                onChange={(e) => setSettings({ ...settings, heroTagEn: e.target.value })}
                className="admin-input"
              />
            </Field>
            <Field label="Hero Tag (AR)">
              <input
                type="text"
                value={settings.heroTagAr}
                onChange={(e) => setSettings({ ...settings, heroTagAr: e.target.value })}
                dir="rtl"
                className="admin-input"
              />
            </Field>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-bold">Announcement Items</h3>
                <p className="text-xs text-muted-foreground">Add multiple rotating banner items shown on the storefront.</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSettings({
                    ...settings,
                    announcementItems: [
                      ...settings.announcementItems,
                      { id: `announcement-${Date.now()}`, textEn: "New announcement", textAr: "إعلان جديد", enabled: true },
                    ],
                  })
                }
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-4 text-xs font-semibold hover:bg-secondary"
              >
                <Plus className="h-3.5 w-3.5" /> Add Item
              </button>
            </div>
            <div className="space-y-3">
              {settings.announcementItems.map((item) => (
                <div key={item.id} className="grid gap-3 rounded-lg border border-border/60 bg-background p-3 sm:grid-cols-2">
                  <input className="admin-input" value={item.textEn} onChange={(e) => updateAnnouncementItem(item.id, { textEn: e.target.value })} placeholder="English text" />
                  <input className="admin-input" value={item.textAr} onChange={(e) => updateAnnouncementItem(item.id, { textAr: e.target.value })} placeholder="النص بالعربي" dir="rtl" />
                  <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <input type="checkbox" checked={item.enabled} onChange={(e) => updateAnnouncementItem(item.id, { enabled: e.target.checked })} /> Enabled
                  </label>
                  <button
                    type="button"
                    className="justify-self-start text-xs font-semibold text-destructive hover:underline"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        announcementItems: settings.announcementItems.filter((x) => x.id !== item.id),
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Hero Title (EN)">
              <input
                type="text"
                value={settings.heroTitleEn}
                onChange={(e) => setSettings({ ...settings, heroTitleEn: e.target.value })}
                className="admin-input"
              />
            </Field>
            <Field label="Hero Title (AR)">
              <input
                type="text"
                value={settings.heroTitleAr}
                onChange={(e) => setSettings({ ...settings, heroTitleAr: e.target.value })}
                dir="rtl"
                className="admin-input"
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Hero Subtitle (EN)">
              <textarea
                value={settings.heroSubtitleEn}
                onChange={(e) => setSettings({ ...settings, heroSubtitleEn: e.target.value })}
                className="admin-input !h-20 resize-none"
              />
            </Field>
            <Field label="Hero Subtitle (AR)">
              <textarea
                value={settings.heroSubtitleAr}
                onChange={(e) => setSettings({ ...settings, heroSubtitleAr: e.target.value })}
                dir="rtl"
                className="admin-input !h-20 resize-none"
              />
            </Field>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/50 p-4 space-y-4">
            <div>
              <h3 className="font-display text-lg font-bold">Homepage Sections</h3>
              <p className="text-xs text-muted-foreground">
                Edit the public homepage section labels/titles without changing code.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Categories eyebrow EN", "categoriesEyebrowEn"],
                ["Categories eyebrow AR", "categoriesEyebrowAr"],
                ["Categories title EN", "categoriesTitleEn"],
                ["Categories title AR", "categoriesTitleAr"],
                ["Featured eyebrow EN", "featuredEyebrowEn"],
                ["Featured eyebrow AR", "featuredEyebrowAr"],
                ["Featured title EN", "featuredTitleEn"],
                ["Featured title AR", "featuredTitleAr"],
                ["Trending eyebrow EN", "trendingEyebrowEn"],
                ["Trending eyebrow AR", "trendingEyebrowAr"],
                ["Trending title EN", "trendingTitleEn"],
                ["Trending title AR", "trendingTitleAr"],
              ].map(([label, key]) => (
                <Field key={key} label={label}>
                  <input
                    type="text"
                    value={String(settings[key as keyof typeof settings] || "")}
                    onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                    dir={String(label).includes(" AR") ? "rtl" : undefined}
                    className="admin-input"
                  />
                </Field>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/50 p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-bold">Trust Cards</h3>
                <p className="text-xs text-muted-foreground">
                  Add, hide, or rewrite the four homepage trust cards.
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:border-primary hover:text-primary"
                onClick={() =>
                  setSettings({
                    ...settings,
                    trustCards: [
                      ...settings.trustCards,
                      {
                        id: `trust-${Date.now()}`,
                        titleEn: "New benefit",
                        titleAr: "ميزة جديدة",
                        subtitleEn: "Short subtitle",
                        subtitleAr: "وصف قصير",
                        enabled: true,
                      },
                    ],
                  })
                }
              >
                + Add trust card
              </button>
            </div>
            <div className="space-y-3">
              {settings.trustCards.map((card) => (
                <div key={card.id} className="grid gap-3 rounded-xl border border-border/50 bg-card/50 p-3 sm:grid-cols-[auto_1fr_1fr_1fr_1fr_auto]">
                  <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={card.enabled}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          trustCards: settings.trustCards.map((x) =>
                            x.id === card.id ? { ...x, enabled: e.target.checked } : x,
                          ),
                        })
                      }
                    />
                    Show
                  </label>
                  <input
                    value={card.titleEn}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        trustCards: settings.trustCards.map((x) =>
                          x.id === card.id ? { ...x, titleEn: e.target.value } : x,
                        ),
                      })
                    }
                    placeholder="Title EN"
                    className="admin-input"
                  />
                  <input
                    value={card.titleAr}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        trustCards: settings.trustCards.map((x) =>
                          x.id === card.id ? { ...x, titleAr: e.target.value } : x,
                        ),
                      })
                    }
                    placeholder="Title AR"
                    dir="rtl"
                    className="admin-input"
                  />
                  <input
                    value={card.subtitleEn}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        trustCards: settings.trustCards.map((x) =>
                          x.id === card.id ? { ...x, subtitleEn: e.target.value } : x,
                        ),
                      })
                    }
                    placeholder="Subtitle EN"
                    className="admin-input"
                  />
                  <input
                    value={card.subtitleAr}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        trustCards: settings.trustCards.map((x) =>
                          x.id === card.id ? { ...x, subtitleAr: e.target.value } : x,
                        ),
                      })
                    }
                    placeholder="Subtitle AR"
                    dir="rtl"
                    className="admin-input"
                  />
                  <button
                    type="button"
                    className="text-xs font-semibold text-destructive hover:underline"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        trustCards: settings.trustCards.filter((x) => x.id !== card.id),
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={savingSettings}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> {savingSettings ? (isAr ? "جاري الحفظ…" : "Saving…") : (isAr ? "حفظ الإعدادات" : "Save Settings")}
        </button>
      </form>
    </div>
  );
}

/* ─────────────────────────────────────── Helpers ───────────────────── */
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
        {required && <span className="text-primary ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-card py-16 text-center">
      <Package className="h-10 w-10 text-muted-foreground/30 mb-3" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
