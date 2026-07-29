import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/currency";
import { TrendingUp, ShoppingCart, Package, Users, Award } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid
} from "recharts";

const CHART_COLORS = ["#00D4FF", "#FF6B35", "#22c55e", "#eab308", "#a855f7", "#ec4899"];
const TOOLTIP_STYLE = { background: "#111", border: "1px solid #222", borderRadius: 12, color: "#fff", fontSize: 12 };

export default function SalesDashboard({ products }) {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => base44.entities.Order.list("-created_date", 500),
  });

  const stats = useMemo(() => {
    const paidOrders = orders.filter(o => o.status !== "cancelled");
    const totalRevenue = paidOrders.reduce((s, o) => s + (o.total || 0), 0);
    const totalOrders = paidOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Units sold per product
    const unitMap = {};
    const revenueMap = {};
    paidOrders.forEach(order => {
      (order.items || []).forEach(item => {
        const key = item.product_id || item.product_name;
        const name = item.product_name || "Unknown";
        unitMap[key] = (unitMap[key] || { name, units: 0 });
        unitMap[key].units += (item.quantity || 1);
        revenueMap[key] = (revenueMap[key] || { name, revenue: 0 });
        revenueMap[key].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });

    const topByUnits = Object.values(unitMap)
      .sort((a, b) => b.units - a.units)
      .slice(0, 6)
      .map(d => ({ ...d, name: d.name.length > 14 ? d.name.slice(0, 14) + "…" : d.name }));

    const topByRevenue = Object.values(revenueMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6)
      .map(d => ({ ...d, name: d.name.length > 14 ? d.name.slice(0, 14) + "…" : d.name }));

    // Orders over last 14 days
    const now = Date.now();
    const dayMs = 86400000;
    const dailyMap = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * dayMs);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      dailyMap[key] = { date: key, orders: 0, revenue: 0 };
    }
    paidOrders.forEach(order => {
      const d = new Date(order.created_date);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      if (dailyMap[key]) {
        dailyMap[key].orders += 1;
        dailyMap[key].revenue += order.total || 0;
      }
    });
    const dailyData = Object.values(dailyMap);

    // Category revenue breakdown
    const catMap = {};
    paidOrders.forEach(order => {
      (order.items || []).forEach(item => {
        const cat = item.category || "Other";
        catMap[cat] = (catMap[cat] || 0) + (item.price || 0) * (item.quantity || 1);
      });
    });
    const categoryData = Object.entries(catMap)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    return { totalRevenue, totalOrders, avgOrderValue, topByUnits, topByRevenue, dailyData, categoryData };
  }, [orders]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />)}
      </div>
    );
  }

  const statCards = [
    { icon: TrendingUp, label: "Total Revenue", value: formatPrice(stats.totalRevenue), color: "#00D4FF" },
    { icon: ShoppingCart, label: "Total Orders", value: stats.totalOrders, color: "#FF6B35" },
    { icon: Users, label: "Avg. Order Value", value: formatPrice(stats.avgOrderValue), color: "#22c55e" },
    { icon: Package, label: "Products Tracked", value: products.length, color: "#eab308" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white/5 border border-white/5 p-4">
            <s.icon className="w-5 h-5 mb-2" style={{ color: s.color }} />
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {stats.totalOrders === 0 && (
        <div className="rounded-2xl bg-white/5 border border-white/5 p-8 text-center">
          <ShoppingCart className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-semibold">No orders yet</p>
          <p className="text-xs text-gray-600 mt-1">Sales data will appear here once orders come in.</p>
        </div>
      )}

      {stats.totalOrders > 0 && (
        <>
          {/* Revenue over 14 days */}
          <div>
            <h2 className="text-base font-bold mb-3">Revenue — Last 14 Days</h2>
            <div className="rounded-2xl bg-white/5 border border-white/5 p-4">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={stats.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                  <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 9 }} axisLine={false} tickLine={false} interval={2} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 9 }} axisLine={false} tickLine={false} width={50} tickFormatter={v => formatPrice(v)} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [formatPrice(v), "Revenue"]} />
                  <Line type="monotone" dataKey="revenue" stroke="#00D4FF" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top products by units sold */}
          {stats.topByUnits.length > 0 && (
            <div>
              <h2 className="text-base font-bold mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-[#FF6B35]" /> Top Products by Units Sold
              </h2>
              <div className="rounded-2xl bg-white/5 border border-white/5 p-4">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.topByUnits} layout="vertical" margin={{ left: 0, right: 16 }}>
                    <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: "#e5e7eb", fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [v, "Units"]} />
                    <Bar dataKey="units" radius={[0, 6, 6, 0]}>
                      {stats.topByUnits.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Top products by revenue */}
          {stats.topByRevenue.length > 0 && (
            <div>
              <h2 className="text-base font-bold mb-3">Top Products by Revenue</h2>
              <div className="space-y-2">
                {stats.topByRevenue.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-black flex-shrink-0"
                      style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}>
                      {i + 1}
                    </span>
                    <p className="flex-1 text-sm font-semibold truncate">{item.name}</p>
                    <p className="text-sm font-bold" style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}>
                      {formatPrice(item.revenue)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revenue by category */}
          {stats.categoryData.length > 0 && (
            <div>
              <h2 className="text-base font-bold mb-3">Revenue by Category</h2>
              <div className="rounded-2xl bg-white/5 border border-white/5 p-4">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={stats.categoryData}>
                    <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#9ca3af", fontSize: 9 }} axisLine={false} tickLine={false} width={50} tickFormatter={v => formatPrice(v)} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [formatPrice(v), "Revenue"]} />
                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                      {stats.categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent orders */}
          <div>
            <h2 className="text-base font-bold mb-3">Recent Orders</h2>
            <div className="space-y-2">
              {orders.slice(0, 8).map(order => (
                <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {order.customer_name || order.customer_email || order.order_number || "Order"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(order.items || []).length} item{(order.items || []).length !== 1 ? "s" : ""} · {new Date(order.created_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-white">{formatPrice(order.total)}</p>
                    <span className={`text-[10px] font-semibold capitalize ${
                      order.status === "delivered" ? "text-green-400" :
                      order.status === "cancelled" ? "text-red-400" :
                      order.status === "paid" ? "text-[#00D4FF]" : "text-gray-400"
                    }`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}