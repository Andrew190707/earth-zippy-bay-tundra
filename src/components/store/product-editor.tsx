import { useState, type FormEvent } from "react";
import { CircleAlert, X } from "lucide-react";
import { slugify } from "@/lib/store/money";
import type { Product, ProductImage, ProductInput } from "@/lib/store/types";

async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const max = 1400;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process that image.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
  if (dataUrl.length > 900_000) {
    throw new Error("That image is still too large after compression. Use a smaller file or a public URL.");
  }
  return dataUrl;
}

export function ProductEditor({
  product,
  onClose,
  onSave,
  error,
  pending,
}: {
  product: Product | null;
  onClose: () => void;
  onSave: (payload: ProductInput) => void;
  error: string;
  pending: boolean;
}) {
  const [form, setForm] = useState<ProductInput>(() =>
    product
      ? {
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice ?? undefined,
          category: product.category,
          images: product.images,
          sizes: product.sizes,
          colors: product.colors,
          stock: product.stock,
          sku: product.sku,
          featured: product.featured,
          newArrival: product.newArrival,
          published: product.published,
        }
      : {
          name: "",
          slug: "",
          description: "",
          price: 0,
          category: "",
          images: [],
          sizes: [],
          colors: [],
          stock: 0,
          sku: "",
          featured: false,
          newArrival: true,
          published: false,
        },
  );
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);
  const [imageUrl, setImageUrl] = useState("");
  const [sizesInput, setSizesInput] = useState(product?.sizes.join(", ") || "");
  const [colorsInput, setColorsInput] = useState(product?.colors.join(", ") || "");
  const [uploadNote, setUploadNote] = useState("");
  const [uploading, setUploading] = useState(false);

  const change = (key: keyof ProductInput, value: string | number | boolean) =>
    setForm((current) => ({ ...current, [key]: value }) as ProductInput);

  const addUrl = () => {
    const url = imageUrl.trim();
    if (!url) return;
    setImages((current) => [...current, { url, alt: form.name || "UV product" }]);
    setImageUrl("");
    setUploadNote("Image URL added.");
  };

  const uploadFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setUploadNote("");
    try {
      const url = await compressImage(file);
      setImages((current) => [...current, { url, alt: form.name || file.name }]);
      setUploadNote("Image compressed and attached. It will save with the product.");
    } catch (err) {
      setUploadNote(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      slug: form.slug || slugify(form.name),
      images,
      sizes: sizesInput.split(",").map((s) => s.trim()).filter(Boolean),
      colors: colorsInput.split(",").map((s) => s.trim()).filter(Boolean),
      price: Number(form.price),
      stock: Number(form.stock),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
    });
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form className="product-modal" onSubmit={submit}>
        <div className="modal-heading">
          <div>
            <span className="eyebrow">{product ? "EDIT THE DETAILS" : "A NEW ADDITION"}</span>
            <h2>{product ? "Refine this piece." : "Add to the collection."}</h2>
          </div>
          <button type="button" className="icon-button" aria-label="Close" onClick={onClose}>
            <X size={19} />
          </button>
        </div>
        <div className="editor-grid">
          <label className="field">
            Product name
            <input required minLength={2} value={form.name} onChange={(e) => change("name", e.target.value)} />
          </label>
          <label className="field">
            Slug
            <input value={form.slug} onChange={(e) => change("slug", e.target.value)} placeholder="generated-from-name" />
          </label>
          <label className="field">
            Category
            <input required value={form.category} onChange={(e) => change("category", e.target.value)} />
          </label>
          <label className="field">
            SKU
            <input required value={form.sku} onChange={(e) => change("sku", e.target.value)} />
          </label>
          <label className="field">
            Price (₹)
            <input required type="number" min="0" value={form.price} onChange={(e) => change("price", Number(e.target.value))} />
          </label>
          <label className="field">
            Compare-at price
            <input
              type="number"
              min="0"
              value={form.compareAtPrice ?? ""}
              onChange={(e) => change("compareAtPrice", Number(e.target.value))}
            />
          </label>
          <label className="field">
            Stock
            <input required type="number" min="0" value={form.stock} onChange={(e) => change("stock", Number(e.target.value))} />
          </label>
          <label className="field">
            Sizes, comma separated
            <input value={sizesInput} onChange={(e) => setSizesInput(e.target.value)} placeholder="S, M, L, XL" />
          </label>
          <label className="field full-field">
            Colors, comma separated
            <input value={colorsInput} onChange={(e) => setColorsInput(e.target.value)} placeholder="Black, Stone" />
          </label>
          <label className="field full-field">
            Description
            <textarea rows={3} value={form.description} onChange={(e) => change("description", e.target.value)} />
          </label>
          <label className="field full-field">
            Add image URL
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
            />
          </label>
        </div>
        <div className="modal-actions" style={{ border: 0, paddingTop: 8, justifyContent: "flex-start" }}>
          <button type="button" className="text-link" onClick={addUrl}>
            Add URL
          </button>
          <label className="upload-file">
            Choose image
            <input type="file" accept="image/*" disabled={uploading} onChange={(e) => uploadFile(e.target.files?.[0])} />
          </label>
        </div>
        {images.length > 0 && (
          <div className="image-list">
            {images.map((image, index) => (
              <div className="image-list-row" key={`${image.url}-${index}`}>
                <img src={image.url} alt={image.alt} />
                <span>{image.alt || `Image ${index + 1}`}</span>
                <button
                  type="button"
                  className="text-link"
                  onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="upload-state">
          Images are stored as web URLs (or a compressed JPEG if you upload a file). For production, prefer a CDN or object-storage URL.
          {uploadNote && <span>{uploadNote}</span>}
          {uploading && <span>Processing image…</span>}
        </div>
        <div className="editor-toggles">
          <label>
            <input type="checkbox" checked={form.featured} onChange={(e) => change("featured", e.target.checked)} /> Featured
          </label>
          <label>
            <input type="checkbox" checked={form.newArrival} onChange={(e) => change("newArrival", e.target.checked)} /> New arrival
          </label>
          <label>
            <input type="checkbox" checked={form.published} onChange={(e) => change("published", e.target.checked)} /> Published
          </label>
        </div>
        {error && (
          <div className="inline-error">
            <CircleAlert size={16} />
            {error}
          </div>
        )}
        <div className="modal-actions">
          <button type="button" className="text-link" onClick={onClose}>
            Cancel
          </button>
          <button className="button button-dark compact" disabled={pending || uploading}>
            {pending ? "Saving…" : product ? "Save changes" : "Create piece"}
          </button>
        </div>
      </form>
    </div>
  );
}
