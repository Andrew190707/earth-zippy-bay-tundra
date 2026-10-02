import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Check, CircleAlert, Plus } from "lucide-react";
import {
  createProduct,
  deleteProduct,
  getAdminDashboard,
  listAdminOrders,
  listAdminProducts,
  listInventory,
  updateInventory,
  updateOrderStatus,
  updateProduct,
} from "@/lib/store/admin";
import { FULFILMENT_UPDATES } from "@/lib/store/constants";
import { money } from "@/lib/store/money";
import type { InventoryItem, Order, OrderStatus, Product, ProductInput } from "@/lib/store/types";
import { EmptyState, ProductImage, Status } from "./ui";
import { ProductEditor } from "./product-editor";

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function AdminLoading() {
  return (
    <div className="admin-skeleton">
      <div />
      <div />
      <div />
    </div>
  );
}

function OrderTable({
  orders,
  onStatus,
}: {
  orders: Order[];
  onStatus: (id: string, status: OrderStatus) => void;
}) {
  return (
    <div className="table-scroll">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Fulfilment</th>
            <th>Update</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <strong>{o.orderNumber}</strong>
                <small>{o.items.length} pieces</small>
              </td>
              <td>
                {o.customerName}
                <small>{o.customerEmail}</small>
              </td>
              <td>
                {new Date(o.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td>{money(o.total)}</td>
              <td>
                <span className={`status-pill ${o.paymentStatus}`}>{o.paymentStatus}</span>
              </td>
              <td>
                <span className={`status-pill ${o.status}`}>{o.status}</span>
              </td>
              <td>
                <select
                  aria-label={`Update order ${o.orderNumber}`}
                  value=""
                  onChange={(e) => {
                    if (e.target.value) onStatus(o.id, e.target.value as OrderStatus);
                  }}
                >
                  <option value="">Change…</option>
                  {FULFILMENT_UPDATES.map((s) => (
                    <option value={s} key={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InventoryTable({
  inventory,
  onSave,
}: {
  inventory: InventoryItem[];
  onSave: (item: InventoryItem, value: number) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  return (
    <div className="table-scroll">
      <table className="admin-table inventory-table">
        <thead>
          <tr>
            <th>Piece</th>
            <th>SKU</th>
            <th>Stock</th>
            <th>Level</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.productId}>
              <td>
                <strong>{item.productName}</strong>
              </td>
              <td>{item.sku}</td>
              <td>
                <input
                  aria-label={`${item.productName} stock`}
                  type="number"
                  min="0"
                  value={values[item.productId] ?? item.stock}
                  onChange={(e) => setValues({ ...values, [item.productId]: e.target.value })}
                />
              </td>
              <td>
                <span className={`status-pill ${item.lowStock ? "pending" : "paid"}`}>
                  {item.lowStock ? "Low stock" : "In stock"}
                </span>
              </td>
              <td>
                <button
                  className="text-link"
                  disabled={Number(values[item.productId] ?? item.stock) === item.stock}
                  onClick={() => onSave(item, Math.max(0, Number(values[item.productId])))}
                >
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminDesk({ onSignOut }: { onSignOut: () => void }) {
  const [tab, setTab] = useState<"overview" | "products" | "inventory" | "orders">("overview");
  const [editing, setEditing] = useState<Product | null | "new">(null);
  const [formError, setFormError] = useState("");
  const [saved, setSaved] = useState("");
  const qc = useQueryClient();
  const dashboard = useQuery({ queryKey: ["admin-dashboard"], queryFn: () => getAdminDashboard() });
  const products = useQuery({ queryKey: ["admin-products"], queryFn: () => listAdminProducts() });
  const inventory = useQuery({
    queryKey: ["admin-inventory"],
    queryFn: () => listInventory(),
    enabled: tab === "inventory",
  });
  const orders = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => listAdminOrders({ data: {} }),
    enabled: tab === "orders",
  });
  const create = useMutation({ mutationFn: (payload: ProductInput) => createProduct({ data: payload }) });
  const update = useMutation({
    mutationFn: (vars: { productId: string; data: ProductInput }) => updateProduct({ data: vars }),
  });
  const remove = useMutation({ mutationFn: (productId: string) => deleteProduct({ data: { productId } }) });
  const updateStock = useMutation({
    mutationFn: (vars: { productId: string; stock: number }) => updateInventory({ data: vars }),
  });
  const statusMut = useMutation({
    mutationFn: (vars: { orderId: string; status: OrderStatus }) => updateOrderStatus({ data: vars }),
  });

  const refreshProducts = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["admin-products"] }),
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] }),
      qc.invalidateQueries({ queryKey: ["products"] }),
      qc.invalidateQueries({ queryKey: ["collections"] }),
    ]);
  };
  const showResult = (message: string) => {
    setSaved(message);
    setTimeout(() => setSaved(""), 3000);
  };
  const tabs = ["overview", "products", "inventory", "orders"] as const;

  return (
    <>
      <div className="admin-shell">
        <aside className="admin-side">
          <Link to="/" className="wordmark">
            UV<span>®</span>
          </Link>
          <span className="eyebrow">STORE DESK</span>
          <nav>
            {tabs.map((t) => (
              <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
                {t === "overview" ? "Overview" : t === "products" ? "Products" : t === "inventory" ? "Inventory" : "Orders"}
                <ArrowRight size={14} />
              </button>
            ))}
          </nav>
          <button className="admin-signout" onClick={onSignOut}>
            Sign out
          </button>
        </aside>
        <main className="admin-main">
          <header className="admin-top">
            <div>
              <span className="eyebrow">UV / OWNER VIEW</span>
              <h1>{tab === "overview" ? "Good work, in progress." : tab[0].toUpperCase() + tab.slice(1)}</h1>
            </div>
            <Link to="/" className="text-link">
              View storefront <ArrowRight size={14} />
            </Link>
          </header>
          {saved && (
            <div className="success-banner">
              <Check size={16} />
              {saved}
            </div>
          )}
          {tab === "overview" &&
            (dashboard.isLoading ? (
              <AdminLoading />
            ) : dashboard.isError ? (
              <Status error={dashboard.error} retry={() => dashboard.refetch()} />
            ) : (
              <>
                <section className="metric-grid">
                  <Metric label="Total orders" value={String(dashboard.data?.totalOrders ?? 0)} note="All time" />
                  <Metric label="Gross revenue" value={money(dashboard.data?.totalRevenue ?? 0)} note="Paid orders" />
                  <Metric label="Live pieces" value={String(dashboard.data?.productCount ?? 0)} note="Across the collection" />
                  <Metric label="Low stock" value={String(dashboard.data?.lowStockCount ?? 0)} note="Worth a closer look" />
                </section>
                <section className="admin-panel">
                  <div className="admin-panel-heading">
                    <div>
                      <span className="eyebrow">RECENT ACTIVITY</span>
                      <h2>Orders, lately.</h2>
                    </div>
                    <button className="text-link" onClick={() => setTab("orders")}>
                      All orders <ArrowRight size={14} />
                    </button>
                  </div>
                  {dashboard.data?.recentOrders?.length ? (
                    <OrderTable
                      orders={dashboard.data.recentOrders}
                      onStatus={(id, status) =>
                        statusMut.mutate(
                          { orderId: id, status },
                          {
                            onSuccess: () => {
                              qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
                              qc.invalidateQueries({ queryKey: ["admin-orders"] });
                              showResult("Order status updated.");
                            },
                          },
                        )
                      }
                    />
                  ) : (
                    <EmptyState
                      title="No orders have landed yet."
                      copy="Orders will appear here as soon as the first customer checks out."
                    />
                  )}
                </section>
              </>
            ))}
          {tab === "products" && (
            <section className="admin-panel">
              <div className="admin-panel-heading">
                <div>
                  <span className="eyebrow">THE CATALOG</span>
                  <h2>Every piece.</h2>
                </div>
                <button
                  className="button button-dark compact"
                  onClick={() => {
                    setEditing("new");
                    setFormError("");
                  }}
                >
                  Add a piece <Plus size={15} />
                </button>
              </div>
              {products.isLoading ? (
                <AdminLoading />
              ) : products.isError ? (
                <Status error={products.error} retry={() => products.refetch()} />
              ) : products.data?.length ? (
                <div className="admin-product-list">
                  {products.data.map((p) => (
                    <div className="admin-product-row" key={p.id}>
                      <div className="admin-product-thumb">
                        <ProductImage product={p} />
                      </div>
                      <div className="admin-product-name">
                        <strong>{p.name}</strong>
                        <span>
                          {p.sku} · {p.category}
                        </span>
                      </div>
                      <span>{money(p.price)}</span>
                      <span className={`status-pill ${p.published ? "paid" : "pending"}`}>
                        {p.published ? "Published" : "Draft"}
                      </span>
                      <button
                        className="text-link"
                        onClick={() => {
                          setEditing(p);
                          setFormError("");
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="admin-delete"
                        aria-label={`Delete ${p.name}`}
                        onClick={() => {
                          if (window.confirm(`Delete ${p.name}? This cannot be undone.`)) {
                            remove.mutate(p.id, {
                              onSuccess: async () => {
                                await refreshProducts();
                                showResult("Product deleted.");
                              },
                              onError: (err) => setFormError(err instanceof Error ? err.message : "Delete failed."),
                            });
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Your catalog is ready for its first piece."
                  copy="Add a product to begin building your collection."
                  action={
                    <button className="button button-dark compact" onClick={() => setEditing("new")}>
                      Add a piece <Plus size={15} />
                    </button>
                  }
                />
              )}
              {formError && (
                <div className="inline-error">
                  <CircleAlert size={16} />
                  {formError}
                </div>
              )}
            </section>
          )}
          {tab === "inventory" && (
            <section className="admin-panel">
              <div className="admin-panel-heading">
                <div>
                  <span className="eyebrow">STOCK CONTROL</span>
                  <h2>On the shelf.</h2>
                </div>
                <span className="admin-count">{inventory.data?.length ?? 0} SKUs</span>
              </div>
              {inventory.isLoading ? (
                <AdminLoading />
              ) : inventory.isError ? (
                <Status error={inventory.error} retry={() => inventory.refetch()} />
              ) : inventory.data?.length ? (
                <InventoryTable
                  inventory={inventory.data}
                  onSave={(item, stock) =>
                    updateStock.mutate(
                      { productId: item.productId, stock },
                      {
                        onSuccess: async () => {
                          await Promise.all([
                            qc.invalidateQueries({ queryKey: ["admin-inventory"] }),
                            qc.invalidateQueries({ queryKey: ["admin-dashboard"] }),
                            qc.invalidateQueries({ queryKey: ["admin-products"] }),
                          ]);
                          showResult(`${item.productName} stock updated.`);
                        },
                        onError: (err) => setFormError(err instanceof Error ? err.message : "Update failed."),
                      },
                    )
                  }
                />
              ) : (
                <EmptyState title="No inventory to show." copy="Product stock levels appear here once your catalog is populated." />
              )}
              {formError && <div className="inline-error">{formError}</div>}
            </section>
          )}
          {tab === "orders" && (
            <section className="admin-panel">
              <div className="admin-panel-heading">
                <div>
                  <span className="eyebrow">FULFILMENT</span>
                  <h2>Orders.</h2>
                </div>
                <span className="admin-count">{orders.data?.length ?? 0} ORDERS</span>
              </div>
              {orders.isLoading ? (
                <AdminLoading />
              ) : orders.isError ? (
                <Status error={orders.error} retry={() => orders.refetch()} />
              ) : orders.data?.length ? (
                <OrderTable
                  orders={orders.data}
                  onStatus={(id, status) =>
                    statusMut.mutate(
                      { orderId: id, status },
                      {
                        onSuccess: () => {
                          qc.invalidateQueries({ queryKey: ["admin-orders"] });
                          qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
                          showResult("Order status updated.");
                        },
                        onError: (err) => setFormError(err instanceof Error ? err.message : "Update failed."),
                      },
                    )
                  }
                />
              ) : (
                <EmptyState title="Nothing to pack just yet." copy="New orders will arrive here." />
              )}
              {formError && <div className="inline-error">{formError}</div>}
            </section>
          )}
        </main>
      </div>
      {editing && (
        <ProductEditor
          product={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={async (payload) => {
            try {
              setFormError("");
              if (editing === "new") await create.mutateAsync(payload);
              else await update.mutateAsync({ productId: editing.id, data: payload });
              await refreshProducts();
              setEditing(null);
              showResult(editing === "new" ? "Product created." : "Product updated.");
            } catch (err) {
              setFormError(err instanceof Error ? err.message : "Could not save product.");
            }
          }}
          error={formError}
          pending={create.isPending || update.isPending}
        />
      )}
    </>
  );
}
