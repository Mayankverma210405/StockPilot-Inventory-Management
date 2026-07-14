import { useState } from 'react'
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, BarChart3, Download, FileSpreadsheet, PackageCheck } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { totalStock } from '../types'
import { currency, downloadCsv, formatDate, number } from '../utils'
import { EmptyState, StatusBadge, Toast } from '../components/UI'

type ReportTab = 'current' | 'movements' | 'low-stock'

export function ReportsPage() {
  const { products, warehouses, movements } = useApp()
  const [params, setParams] = useSearchParams()
  const requestedTab = params.get('tab')

  const tab: ReportTab =
    requestedTab === 'low-stock' || requestedTab === 'movements'
      ? requestedTab
      : 'current'

  const setTab = (nextTab: ReportTab) => {
    const nextParams = new URLSearchParams(params)

    if (nextTab === 'current') {
      nextParams.delete('tab')
    } else {
      nextParams.set('tab', nextTab)
    }

    setParams(nextParams, { replace: true })
  }
  const [warehouseId, setWarehouseId] = useState('ALL')
  const [toast, setToast] = useState('')
  const lowStock = products.filter((product) => totalStock(product) <= product.reorderPoint)
  const currentProducts = products.map((product) => ({ ...product, displayStock: warehouseId === 'ALL' ? totalStock(product) : product.stocks[warehouseId] ?? 0 }))

  const exportReport = () => {
    if (tab === 'current') downloadCsv('current-stock-report.csv', [['SKU', 'Product', 'Category', 'Warehouse filter', 'Available quantity', 'Unit cost', 'Inventory value'], ...currentProducts.map((product) => [product.sku, product.name, product.category, warehouseId === 'ALL' ? 'All warehouses' : warehouses.find((warehouse) => warehouse.id === warehouseId)?.name ?? '', product.displayStock, product.cost, product.displayStock * product.cost])])
    if (tab === 'movements') downloadCsv('stock-movement-report.csv', [['Date', 'Type', 'Reference', 'Product', 'SKU', 'Warehouse', 'Quantity', 'Performed by'], ...movements.map((movement) => { const product = products.find((item) => item.id === movement.productId); const warehouse = warehouses.find((item) => item.id === movement.warehouseId); return [formatDate(movement.createdAt, true), movement.type, movement.reference, product?.name ?? '', product?.sku ?? '', warehouse?.name ?? '', movement.quantity, movement.performedBy] })])
    if (tab === 'low-stock') downloadCsv('low-stock-report.csv', [['SKU', 'Product', 'Category', 'Available', 'Reorder point', 'Shortage', 'Supplier'], ...lowStock.map((product) => [product.sku, product.name, product.category, totalStock(product), product.reorderPoint, Math.max(0, product.reorderPoint - totalStock(product)), product.supplier])])
    setToast('CSV report downloaded'); setTimeout(() => setToast(''), 2400)
  }

  return <div className="page-stack"><div className="page-heading-row"><div><h2>Inventory reports</h2><p>Analyze stock positions, transaction activity, and replenishment risk.</p></div><button className="button primary" onClick={exportReport}><Download size={18} /> Export CSV</button></div><section className="report-kpis"><div><span className="stat-icon blue"><PackageCheck size={20} /></span><p>Stock on hand<strong>{number.format(products.reduce((sum, product) => sum + totalStock(product), 0))} units</strong></p></div><div><span className="stat-icon green"><FileSpreadsheet size={20} /></span><p>Total stock value<strong>{currency.format(products.reduce((sum, product) => sum + totalStock(product) * product.cost, 0))}</strong></p></div><div><span className="stat-icon amber"><AlertTriangle size={20} /></span><p>Reorder required<strong>{lowStock.length} products</strong></p></div></section><div className="report-tabs"><button className={tab === 'current' ? 'active' : ''} onClick={() => setTab('current')}><PackageCheck size={17} /> Current stock</button><button className={tab === 'movements' ? 'active' : ''} onClick={() => setTab('movements')}><BarChart3 size={17} /> Stock movement</button><button className={tab === 'low-stock' ? 'active' : ''} onClick={() => setTab('low-stock')}><AlertTriangle size={17} /> Low stock <span>{lowStock.length}</span></button></div>{tab === 'current' && <section className="panel report-panel"><div className="panel-header"><div><h3>Current stock report</h3><p>Available quantity and value by product.</p></div><label className="inline-filter">Warehouse<select value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)}><option value="ALL">All warehouses</option>{warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select></label></div><div className="table-wrap"><table><thead><tr><th>Product</th><th>Category</th><th>Available</th><th>Unit cost</th><th>Stock value</th><th>Status</th></tr></thead><tbody>{currentProducts.map((product) => { const low = product.displayStock <= product.reorderPoint; return <tr key={product.id}><td><strong>{product.name}</strong><small>{product.sku}</small></td><td><span className="category-tag">{product.category}</span></td><td><strong>{number.format(product.displayStock)}</strong><small>Reorder at {product.reorderPoint}</small></td><td>{currency.format(product.cost)}</td><td><strong>{currency.format(product.displayStock * product.cost)}</strong></td><td><StatusBadge status={product.displayStock === 0 ? 'out' : low ? 'low' : 'healthy'} /></td></tr> })}</tbody><tfoot><tr><td colSpan={2}>Report total</td><td>{number.format(currentProducts.reduce((sum, product) => sum + product.displayStock, 0))} units</td><td /><td>{currency.format(currentProducts.reduce((sum, product) => sum + product.displayStock * product.cost, 0))}</td><td /></tr></tfoot></table></div></section>}{tab === 'movements' && <section className="panel report-panel"><div className="panel-header"><div><h3>Stock movement report</h3><p>Inbound and outbound activity across all warehouses.</p></div><div className="report-legend"><span><i className="legend-in" />{movements.filter((movement) => movement.type === 'IN').reduce((sum, movement) => sum + movement.quantity, 0)} inbound</span><span><i className="legend-out" />{movements.filter((movement) => movement.type === 'OUT').reduce((sum, movement) => sum + movement.quantity, 0)} outbound</span></div></div><div className="table-wrap"><table><thead><tr><th>Date</th><th>Type</th><th>Reference</th><th>Product</th><th>Warehouse</th><th>Quantity</th></tr></thead><tbody>{movements.map((movement) => { const product = products.find((item) => item.id === movement.productId); const warehouse = warehouses.find((item) => item.id === movement.warehouseId); return <tr key={movement.id}><td>{formatDate(movement.createdAt, true)}</td><td><StatusBadge status={movement.type} /></td><td><strong>{movement.reference}</strong><small>{movement.performedBy}</small></td><td><strong>{product?.name}</strong><small>{product?.sku}</small></td><td>{warehouse?.name}</td><td className={movement.type === 'IN' ? 'qty-in' : 'qty-out'}>{movement.type === 'IN' ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}{number.format(movement.quantity)}</td></tr> })}</tbody></table></div></section>}{tab === 'low-stock' && <section className="panel report-panel"><div className="panel-header"><div><h3>Low-stock report</h3><p>Products that have reached or fallen below their reorder point.</p></div><span className="alert-count">{lowStock.length} items</span></div>{lowStock.length ? <div className="table-wrap"><table><thead><tr><th>Priority</th><th>Product</th><th>Available</th><th>Reorder point</th><th>Shortage</th><th>Supplier</th></tr></thead><tbody>{lowStock.sort((a, b) => totalStock(a) / Math.max(a.reorderPoint, 1) - totalStock(b) / Math.max(b.reorderPoint, 1)).map((product, index) => <tr key={product.id}><td><span className={`priority-tag ${index < 2 ? 'critical' : ''}`}>{index < 2 ? 'Critical' : 'Reorder'}</span></td><td><strong>{product.name}</strong><small>{product.sku} · {product.category}</small></td><td><strong className="negative-text">{number.format(totalStock(product))}</strong></td><td>{number.format(product.reorderPoint)}</td><td><strong>{number.format(Math.max(0, product.reorderPoint - totalStock(product)))}</strong> units</td><td>{product.supplier}</td></tr>)}</tbody></table></div> : <EmptyState icon={<PackageCheck size={30} />} title="No low-stock products" text="All products are above their reorder points." />}</section>}{toast && <Toast message={toast} />}</div>
}
