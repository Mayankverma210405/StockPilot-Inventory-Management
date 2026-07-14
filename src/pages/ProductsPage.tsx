import { useMemo, useState, type FormEvent } from 'react'
import { Edit3, Eye, Filter, PackageOpen, Plus, Search, SlidersHorizontal } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import type { Product } from '../types'
import { totalStock } from '../types'
import { currency, formatDate, number } from '../utils'
import { EmptyState, Modal, StatusBadge, Toast } from '../components/UI'

function stockStatus(product: Product): 'healthy' | 'low' | 'out' {
  const stock = totalStock(product)
  if (stock === 0) return 'out'
  return stock <= product.reorderPoint ? 'low' : 'healthy'
}

export function ProductsPage() {
  const { products, warehouses, addProduct, updateProduct } = useApp()
  const [params, setParams] = useSearchParams()
  const search = params.get('search') ?? ''

  const setSearch = (value: string) => {
    const nextParams = new URLSearchParams(params)

    if (value) {
      nextParams.set('search', value)
    } else {
      nextParams.delete('search')
    }

    setParams(nextParams, { replace: true })
  }
  const [category, setCategory] = useState('All categories')
  const [status, setStatus] = useState('All statuses')
  const [modal, setModal] = useState<'add' | 'edit' | 'view' | null>(null)
  const [selected, setSelected] = useState<Product | null>(null)
  const [toast, setToast] = useState('')
  const categories = useMemo(() => ['All categories', ...Array.from(new Set(products.map((product) => product.category))).sort()], [products])
  const filtered = products.filter((product) => {
    const matchesSearch = `${product.name} ${product.sku} ${product.supplier}`.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === 'All categories' || product.category === category
    const matchesStatus = status === 'All statuses' || stockStatus(product) === status
    return matchesSearch && matchesCategory && matchesStatus
  })

  const openProduct = (product: Product, type: 'view' | 'edit') => { setSelected(product); setModal(type) }
  const success = (message: string) => { setModal(null); setToast(message); setTimeout(() => setToast(''), 2600) }

  return (
    <div className="page-stack">
      <div className="page-heading-row"><div><h2>Product catalog</h2><p>Manage product details, pricing, categories, and stock thresholds.</p></div><button className="button primary" onClick={() => { setSelected(null); setModal('add') }}><Plus size={18} /> Add product</button></div>
      <section className="panel filters-panel">
        <div className="search-field"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by product, SKU, or supplier…" /></div>
        <div className="filter-select"><Filter size={16} /><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></div>
        <div className="filter-select"><SlidersHorizontal size={16} /><select value={status} onChange={(event) => setStatus(event.target.value)}><option>All statuses</option><option value="healthy">In stock</option><option value="low">Low stock</option><option value="out">Out of stock</option></select></div>
        <span className="filter-result">{filtered.length} product{filtered.length === 1 ? '' : 's'}</span>
      </section>
      <section className="panel products-table-panel">
        {filtered.length ? <div className="table-wrap"><table className="products-table"><thead><tr><th>Product</th><th>Category</th><th>Supplier</th><th>Unit cost</th><th>Available</th><th>Status</th><th aria-label="Actions" /></tr></thead><tbody>{filtered.map((product) => <tr key={product.id}><td><button className="product-cell" onClick={() => openProduct(product, 'view')}><span className={`product-icon category-${product.category.toLowerCase().replace(' ', '-')}`}>{product.name.split(' ').slice(0, 2).map((word) => word[0]).join('')}</span><span><strong>{product.name}</strong><small>{product.sku}</small></span></button></td><td><span className="category-tag">{product.category}</span></td><td>{product.supplier}</td><td><strong>{currency.format(product.cost)}</strong><small>Sell {currency.format(product.price)}</small></td><td><strong>{number.format(totalStock(product))}</strong><small>Reorder at {product.reorderPoint}</small></td><td><StatusBadge status={stockStatus(product)} /></td><td><div className="row-actions"><button className="icon-button" onClick={() => openProduct(product, 'view')} aria-label="View product"><Eye size={17} /></button><button className="icon-button" onClick={() => openProduct(product, 'edit')} aria-label="Edit product"><Edit3 size={17} /></button></div></td></tr>)}</tbody></table></div> : <EmptyState icon={<PackageOpen size={30} />} title="No products found" text="Try changing your search or filters." />}
        <footer className="table-footer"><span>Showing {filtered.length} of {products.length} products</span></footer>
      </section>
      {(modal === 'add' || modal === 'edit') && <ProductForm product={modal === 'edit' ? selected : null} products={products} warehouses={warehouses} onClose={() => setModal(null)} onSave={(values) => { if (modal === 'edit' && selected) { updateProduct(selected.id, values); success('Product updated successfully') } else { addProduct(values); success('Product added to catalog') } }} />}
      {modal === 'view' && selected && <ProductDetail product={selected} warehouses={warehouses} onClose={() => setModal(null)} onEdit={() => setModal('edit')} />}
      {toast && <Toast message={toast} />}
    </div>
  )
}

interface ProductValues {
  sku: string
  name: string
  category: string
  supplier: string
  cost: number
  price: number
  reorderPoint: number
  initialWarehouseId?: string
  initialQuantity?: number
}

function ProductForm({ product, products, warehouses, onClose, onSave }: { product: Product | null; products: Product[]; warehouses: ReturnType<typeof useApp>['warehouses']; onClose: () => void; onSave: (values: ProductValues) => void }) {
  const [form, setForm] = useState({ sku: product?.sku ?? '', name: product?.name ?? '', category: product?.category ?? '', supplier: product?.supplier ?? '', cost: String(product?.cost ?? ''), price: String(product?.price ?? ''), reorderPoint: String(product?.reorderPoint ?? ''), initialWarehouseId: warehouses[0]?.id ?? '', initialQuantity: '0' })
  const [error, setError] = useState('')
  const set = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const duplicate = products.some((item) => item.sku.toLowerCase() === form.sku.trim().toLowerCase() && item.id !== product?.id)
    if (duplicate) return setError('This SKU is already in use.')
    if (+form.price < +form.cost) return setError('Selling price should not be lower than unit cost.')
    onSave({ sku: form.sku, name: form.name, category: form.category, supplier: form.supplier, cost: +form.cost, price: +form.price, reorderPoint: +form.reorderPoint, ...(!product ? { initialWarehouseId: form.initialWarehouseId, initialQuantity: +form.initialQuantity } : {}) })
  }
  return <Modal title={product ? 'Edit product' : 'Add new product'} subtitle={product ? 'Update catalog and inventory threshold details.' : 'Create a new product in your inventory catalog.'} onClose={onClose} wide><form onSubmit={submit} className="modal-form"><div className="form-grid"><label className="field-label full">Product name<input value={form.name} onChange={(event) => set('name', event.target.value)} placeholder="e.g. Wireless Barcode Scanner" required /></label><label className="field-label">SKU<input value={form.sku} onChange={(event) => set('sku', event.target.value)} placeholder="ELEC-1001" required /></label><label className="field-label">Category<input list="categories" value={form.category} onChange={(event) => set('category', event.target.value)} placeholder="Electronics" required /><datalist id="categories"><option>Electronics</option><option>Equipment</option><option>Office Supplies</option><option>Packaging</option><option>Safety</option></datalist></label><label className="field-label full">Supplier<input value={form.supplier} onChange={(event) => set('supplier', event.target.value)} placeholder="Supplier or vendor name" required /></label><label className="field-label">Unit cost (₹)<input type="number" min="0" step="0.01" value={form.cost} onChange={(event) => set('cost', event.target.value)} required /></label><label className="field-label">Selling price (₹)<input type="number" min="0" step="0.01" value={form.price} onChange={(event) => set('price', event.target.value)} required /></label><label className="field-label">Reorder point<input type="number" min="0" step="1" value={form.reorderPoint} onChange={(event) => set('reorderPoint', event.target.value)} required /></label>{!product && <><label className="field-label">Initial warehouse<select value={form.initialWarehouseId} onChange={(event) => set('initialWarehouseId', event.target.value)}>{warehouses.map((warehouse) => <option value={warehouse.id} key={warehouse.id}>{warehouse.name}</option>)}</select></label><label className="field-label">Opening quantity<input type="number" min="0" step="1" value={form.initialQuantity} onChange={(event) => set('initialQuantity', event.target.value)} required /></label></>}</div>{error && <div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button className="button primary">{product ? 'Save changes' : 'Add product'}</button></div></form></Modal>
}

function ProductDetail({ product, warehouses, onClose, onEdit }: { product: Product; warehouses: ReturnType<typeof useApp>['warehouses']; onClose: () => void; onEdit: () => void }) {
  return <Modal title="Product details" subtitle={`${product.sku} · Added ${formatDate(product.createdAt)}`} onClose={onClose} wide><div className="product-detail"><div className="detail-hero"><div className="detail-monogram">{product.name.split(' ').slice(0, 2).map((word) => word[0]).join('')}</div><div><span className="category-tag">{product.category}</span><h3>{product.name}</h3><p>Supplied by {product.supplier}</p></div><StatusBadge status={stockStatus(product)} /></div><div className="detail-stats"><div><span>Total available</span><strong>{number.format(totalStock(product))}</strong></div><div><span>Unit cost</span><strong>{currency.format(product.cost)}</strong></div><div><span>Selling price</span><strong>{currency.format(product.price)}</strong></div><div><span>Reorder point</span><strong>{number.format(product.reorderPoint)}</strong></div></div><h4>Stock by warehouse</h4><div className="warehouse-stock-list">{warehouses.map((warehouse) => <div key={warehouse.id}><span><strong>{warehouse.name}</strong><small>{warehouse.code} · {warehouse.location}</small></span><strong>{number.format(product.stocks[warehouse.id] ?? 0)} <small>units</small></strong></div>)}</div><div className="modal-actions"><button className="button secondary" onClick={onClose}>Close</button><button className="button primary" onClick={onEdit}><Edit3 size={17} /> Edit product</button></div></div></Modal>
}
