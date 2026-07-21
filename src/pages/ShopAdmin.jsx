import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Plus, Edit2, Trash2, Save, X, TrendingUp,
  ShoppingBag, DollarSign, Star, Upload, ArrowLeft, Check, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/currency";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

const CATEGORIES = ["Earbuds", "Accessories", "Apparel", "Limited Edition", "Bundles"];

const emptyProduct = {
  name: "", description: "", price: "", original_price: "",
  category: "Earbuds", images: [""], in_stock: true, stock_count: "",
  featured: false, rating: "", reviews_count: "", colors: []
};

export default function ShopAdmin() {
  const qc = useQueryClient();
  const [view, setView] = useState("dashboard"); // dashboard | list | form
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => base44.entities.Product.list("-created_date", 100),
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openNew = () => {
    setEditingProduct(null);
    setForm(emptyProduct);
    setView("form");
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      original_price: product.original_price ?? "",
      category: product.category || "Earbuds",
      images: product.images?.length ? product.images : [""],
      in_stock: product.in_stock !== false,
      stock_count: product.stock_count ?? "",
      featured: product.featured || false,
      rating: product.rating ?? "",
      reviews_count: product.reviews_count ?? "",
      colors: product.colors || [],
    });
    setView("form");
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      showToast("Name and price are required.", "error");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : undefined,
      stock_count: form.stock_count ? parseInt(form.stock_count) : undefined,
      rating: form.rating ? parseFloat(form.rating) : undefined,
      reviews_count: form.reviews_count ? parseInt(form.reviews_count) : undefined,
      images: form.images.filter(Boolean),
    };
    if (editingProduct) {
      await base44.entities.Product.update(editingProduct.id, payload);
      showToast("Product updated.");
    } else {
      await base44.entities.Product.create(payload);
      showToast("Product created.");
    }
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
    qc.invalidateQueries({ queryKey: ["featured-products"] });
    setSaving(false);
    setView("list");
  };

  const handleDelete = async (id) => {
    await base44.entities.Product.delete(id);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
    qc.invalidateQueries({ queryKey: ["featured-products"] });
    setDeleteConfirm(null);
    showToast("Product deleted.");
  };

  const quickUpdatePrice = async (product, newPrice) => {
    const val = parseFloat(newPrice);
    if (isNaN(val) || val <= 0) return;
    await base44.entities.Product.update(product.id, { price: val });
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
    showToast(`Price updated to ${formatPrice(val)}`);
  };

  // Stats
  const totalProducts = products.length;
  const inStock = products.filter(p => p.in_stock !== false).length;
  const avgPrice = products.length ? products.reduce((s, p) => s + (p.price || 0), 0) / products.length : 0;
  const featured = products.filter(p => p.featured).length;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm shadow-xl ${
              toast.type === "error" ? "bg-red-500 text-white" : "bg-[#00D4FF] text-black"
            }`}
          >
            {toast.type === "error" ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 px-5 py-4 bg-[#0A0A0A]/95 backdrop-blur-lg border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/Shop" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-black">Shop Admin</h1>
            <p className="text-xs text-gray-500">Manage products & pricing</p>
          </div>
        </div>
        <div className="flex gap-2">
          {view !== "dashboard" && (
            <button onClick={() => setView("dashboard")} className="px-3 py-2 rounded-xl bg-white/5 text-sm hover:bg-white/10 transition-colors">
              Dashboard
            </button>
          )}
          {view !== "list" && (
            <button onClick={() => setView("list")} className="px-3 py-2 rounded-xl bg-white/5 text-sm hover:bg-white/10 transition-colors">
              Products
            </button>
          )}
          <button onClick={openNew} className="px-3 py-2 rounded-xl bg-[#00D4FF] text-black text-sm font-bold flex items-center gap-1 hover:bg-[#00D4FF]/90 transition-colors">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </header>

      <div className="px-5 py-6 max-w-2xl mx-auto">

        {/* DASHBOARD VIEW */}
        {view === "dashboard" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { icon: Package, label: "Total Products", value: totalProducts, color: "#00D4FF" },
                { icon: ShoppingBag, label: "In Stock", value: inStock, color: "#22c55e" },
                { icon: DollarSign, label: "Avg. Price", value: formatPrice(avgPrice), color: "#FF6B35" },
                { icon: Star, label: "Featured", value: featured, color: "#eab308" },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-2xl bg-white/5 border border-white/5 p-4"
                >
                  <stat.icon className="w-5 h-5 mb-2" style={{ color: stat.color }} />
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Top Products by Price Chart */}
            <h2 className="text-base font-bold mb-4">Top Products by Price</h2>
            <div className="rounded-2xl bg-white/5 border border-white/5 p-4 mb-6">
              {products.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">No products yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[...products].sort((a, b) => b.price - a.price).slice(0, 6).map(p => ({ name: p.name.length > 12 ? p.name.slice(0, 12) + "…" : p.name, price: p.price }))}>
                    <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} width={45} tickFormatter={v => `$${v}`} />
                    <Tooltip
                      contentStyle={{ background: "#111", border: "1px solid #222", borderRadius: 12, color: "#fff", fontSize: 12 }}
                      formatter={(v) => [formatPrice(v), "Price"]}
                    />
                    <Bar dataKey="price" radius={[6, 6, 0, 0]}>
                      {[...products].sort((a, b) => b.price - a.price).slice(0, 6).map((_, i) => (
                        <Cell key={i} fill={i === 0 ? "#00D4FF" : i === 1 ? "#FF6B35" : "#ffffff22"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Category Breakdown Chart */}
            <h2 className="text-base font-bold mb-4">Sales by Category</h2>
            <div className="rounded-2xl bg-white/5 border border-white/5 p-4 mb-6">
              {products.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">No products yet</p>
              ) : (() => {
                const COLORS = ["#00D4FF", "#FF6B35", "#22c55e", "#eab308", "#a855f7"];
                const catData = CATEGORIES
                  .map((cat, i) => ({ name: cat, value: products.filter(p => p.category === cat).length, fill: COLORS[i % COLORS.length] }))
                  .filter(d => d.value > 0);
                return (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                        {catData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#111", border: "1px solid #222", borderRadius: 12, color: "#fff", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>

            {/* Recent Products */}
            <h2 className="text-base font-bold mb-4">Recent Products</h2>
            <div className="space-y-3">
              {products.slice(0, 5).map(product => (
                <div key={product.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5">
                  <img
                    src={product.images?.[0] || "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100"}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    alt={product.name}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm line-clamp-1">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{formatPrice(product.price)}</p>
                    <span className={`text-[10px] font-semibold ${product.in_stock !== false ? "text-green-400" : "text-red-400"}`}>
                      {product.in_stock !== false ? "In Stock" : "Out"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setView("list")} className="w-full mt-4 py-3 rounded-2xl border border-white/10 text-sm text-gray-400 hover:bg-white/5 transition-colors">
              View All Products →
            </button>
          </motion.div>
        )}

        {/* PRODUCT LIST VIEW */}
        {view === "list" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-gray-500 text-sm mb-5">{totalProducts} products total</p>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {products.map(product => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onEdit={() => openEdit(product)}
                    onDelete={() => setDeleteConfirm(product.id)}
                    onPriceUpdate={(val) => quickUpdatePrice(product, val)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* FORM VIEW */}
        {view === "form" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-xl font-black mb-6">{editingProduct ? "Edit Product" : "New Product"}</h2>

            <div className="space-y-5">
              <Field label="Product Name *">
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Buddyz Pro Max" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#00D4FF]" />
              </Field>

              <Field label="Description">
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Product description..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#00D4FF]" />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Price *">
                  <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="0.00" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#00D4FF]" />
                </Field>
                <Field label="Original Price">
                  <Input type="number" value={form.original_price} onChange={e => setForm(f => ({ ...f, original_price: e.target.value }))}
                    placeholder="0.00" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#00D4FF]" />
                </Field>
              </div>

              <Field label="Category">
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00D4FF]">
                  {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
                </select>
              </Field>

              <Field label="Image URLs">
                {form.images.map((url, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input value={url} onChange={e => {
                      const imgs = [...form.images];
                      imgs[i] = e.target.value;
                      setForm(f => ({ ...f, images: imgs }));
                    }} placeholder="https://..." className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#00D4FF]" />
                    {form.images.length > 1 && (
                      <button onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-red-500/20 transition-colors flex-shrink-0">
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={() => setForm(f => ({ ...f, images: [...f.images, ""] }))}
                  className="flex items-center gap-1 text-xs text-[#00D4FF] hover:opacity-80 transition-opacity mt-1">
                  <Plus className="w-3 h-3" /> Add Image URL
                </button>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Stock Count">
                  <Input type="number" value={form.stock_count} onChange={e => setForm(f => ({ ...f, stock_count: e.target.value }))}
                    placeholder="0" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#00D4FF]" />
                </Field>
                <Field label="Rating (0–5)">
                  <Input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))}
                    placeholder="4.5" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#00D4FF]" />
                </Field>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.in_stock} onChange={e => setForm(f => ({ ...f, in_stock: e.target.checked }))}
                    className="w-4 h-4 accent-[#00D4FF]" />
                  <span className="text-sm">In Stock</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                    className="w-4 h-4 accent-[#FF6B35]" />
                  <span className="text-sm">Featured</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setView(editingProduct ? "list" : "dashboard")}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-semibold hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-[#00D4FF] text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#00D4FF]/90 transition-colors disabled:opacity-60">
                  {saving ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving..." : "Save Product"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50" onClick={() => setDeleteConfirm(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-x-5 top-1/2 -translate-y-1/2 z-50 bg-[#111] border border-white/10 rounded-3xl p-6 max-w-sm mx-auto">
              <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-center mb-2">Delete Product?</h3>
              <p className="text-sm text-gray-500 text-center mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-semibold hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors">
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductRow({ product, onEdit, onDelete, onPriceUpdate }) {
  const [editing, setEditing] = useState(false);
  const [priceVal, setPriceVal] = useState(product.price);

  const submit = () => {
    onPriceUpdate(priceVal);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
      <img
        src={product.images?.[0] || "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100"}
        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
        alt={product.name}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="font-semibold text-sm line-clamp-1">{product.name}</p>
          {product.featured && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
        </div>
        <p className="text-xs text-gray-500 mb-1">{product.category}</p>
        {editing ? (
          <div className="flex items-center gap-2">
            <input type="number" value={priceVal} onChange={e => setPriceVal(e.target.value)}
              className="w-24 px-2 py-1 rounded-lg bg-white/10 border border-[#00D4FF]/50 text-white text-sm focus:outline-none" />
            <button onClick={submit} className="w-7 h-7 rounded-lg bg-[#00D4FF] flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-black" />
            </button>
            <button onClick={() => setEditing(false)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-sm font-bold text-[#00D4FF] hover:opacity-70 transition-opacity">
            {formatPrice(product.price)}
            <Edit2 className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2 flex-shrink-0">
        <button onClick={onEdit} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <Edit2 className="w-3.5 h-3.5 text-gray-400" />
        </button>
        <button onClick={onDelete} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-red-500/20 transition-colors">
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}