import { AlertTriangle, ArrowDownLeft, ArrowRight, ArrowUpRight, Boxes, Building2, CircleDollarSign, PackageCheck, PackagePlus, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { totalStock } from '../types'
import { currency, formatDate, number } from '../utils'
import { StatusBadge } from '../components/UI'

export function DashboardPage() {
  const { products, warehouses, movements, user } = useApp()
  const units = products.reduce((sum, product) => sum + totalStock(product), 0)
  const inventoryValue = products.reduce((sum, product) => sum + totalStock(product) * product.cost, 0)
  const lowStock = products.filter((product) => totalStock(product) <= product.reorderPoint)
  const thisMonthIn = movements.filter((movement) => movement.type === 'IN').reduce((sum, movement) => sum + movement.quantity, 0)
  const thisMonthOut = movements.filter((movement) => movement.type === 'OUT').reduce((sum, movement) => sum + movement.quantity, 0)
  const maxWarehouseStock = Math.max(...warehouses.map((warehouse) => products.reduce((sum, product) => sum + (product.stocks[warehouse.id] ?? 0), 0)))

  return (
    <div className="page-stack">
      <div className="welcome-row">
        <div><h2>Good morning, {user?.name.split(' ')[0]}.</h2><p>Here’s what’s happening across your inventory today.</p></div>
        <Link to="/movements?action=new" className="button primary"><PackagePlus size={18} /> Record movement</Link>
      </div>
      <section className="stats-grid">
        <article className="stat-card"><div className="stat-icon indigo"><Boxes size={21} /></div><span>Total products</span><strong>{number.format(products.length)}</strong><small className="positive"><TrendingUp size={14} /> Active catalog</small></article>
        <article className="stat-card"><div className="stat-icon blue"><PackageCheck size={21} /></div><span>Units on hand</span><strong>{number.format(units)}</strong><small className="positive"><ArrowUpRight size={14} /> {number.format(thisMonthIn)} received</small></article>
        <article className="stat-card"><div className="stat-icon green"><CircleDollarSign size={21} /></div><span>Inventory value</span><strong>{currency.format(inventoryValue)}</strong><small>Based on average cost</small></article>
        <article className="stat-card warning-card"><div className="stat-icon amber"><AlertTriangle size={21} /></div><span>Low-stock items</span><strong>{lowStock.length}</strong><small className={lowStock.length ? 'negative' : 'positive'}>{lowStock.length ? 'Action recommended' : 'All levels healthy'}</small></article>
      </section>
      <div className="dashboard-grid">
        <section className="panel movement-overview">
          <div className="panel-header"><div><h3>Stock activity</h3><p>Recent inbound and outbound volume</p></div><select aria-label="Activity range" defaultValue="30"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></div>
          <div className="activity-totals"><div><span className="movement-icon movement-in"><ArrowDownLeft size={18} /></span><p>Stock in<strong>{number.format(thisMonthIn)} units</strong></p></div><div><span className="movement-icon movement-out"><ArrowUpRight size={18} /></span><p>Stock out<strong>{number.format(thisMonthOut)} units</strong></p></div><div className="activity-net"><p>Net change<strong className={thisMonthIn - thisMonthOut >= 0 ? 'positive-text' : 'negative-text'}>{thisMonthIn - thisMonthOut >= 0 ? '+' : ''}{number.format(thisMonthIn - thisMonthOut)}</strong></p></div></div>
          <div className="chart-area" aria-label="Stock activity chart">
            <div className="chart-y"><span>120</span><span>90</span><span>60</span><span>30</span><span>0</span></div>
            <div className="chart-bars">
              {[{ d: 'Jul 8', a: 62, b: 35 }, { d: 'Jul 9', a: 42, b: 54 }, { d: 'Jul 10', a: 79, b: 41 }, { d: 'Jul 11', a: 55, b: 66 }, { d: 'Jul 12', a: 92, b: 50 }, { d: 'Jul 13', a: 73, b: 60 }, { d: 'Jul 14', a: 86, b: 44 }].map((bar) => <div className="chart-column" key={bar.d}><div className="bar-pair"><i className="bar-in" style={{ height: `${bar.a}%` }} /><i className="bar-out" style={{ height: `${bar.b}%` }} /></div><span>{bar.d}</span></div>)}
            </div>
          </div>
          <div className="chart-legend"><span><i className="legend-in" />Stock in</span><span><i className="legend-out" />Stock out</span></div>
        </section>
        <section className="panel low-stock-panel">
          <div className="panel-header"><div><h3>Low-stock alerts</h3><p>Items at or below reorder point</p></div><span className="alert-count">{lowStock.length}</span></div>
          <div className="alert-list">
            {lowStock.slice(0, 4).map((product) => { const stock = totalStock(product); return <div className="alert-item" key={product.id}><div className="product-monogram">{product.name.split(' ').slice(0, 2).map((word) => word[0]).join('')}</div><div><strong>{product.name}</strong><span>{product.sku} · {product.category}</span><div className="stock-meter"><i style={{ width: `${Math.min(100, (stock / Math.max(product.reorderPoint, 1)) * 100)}%` }} /><small>{stock} / {product.reorderPoint} units</small></div></div></div> })}
            {!lowStock.length && <div className="all-healthy"><PackageCheck size={30} /><strong>Stock levels look healthy</strong><span>No items require attention.</span></div>}
          </div>
          <Link to="/reports?tab=low-stock" className="panel-link">View low-stock report <ArrowRight size={16} /></Link>
        </section>
      </div>
      <div className="dashboard-grid lower">
        <section className="panel recent-panel">
          <div className="panel-header"><div><h3>Recent transactions</h3><p>Latest inventory movements</p></div><Link to="/movements" className="text-link">View all <ArrowRight size={15} /></Link></div>
          <div className="table-wrap"><table><thead><tr><th>Transaction</th><th>Product</th><th>Warehouse</th><th>Quantity</th><th>Date</th></tr></thead><tbody>{movements.slice(0, 5).map((movement) => { const product = products.find((item) => item.id === movement.productId); const warehouse = warehouses.find((item) => item.id === movement.warehouseId); return <tr key={movement.id}><td><StatusBadge status={movement.type} /><small className="table-reference">{movement.reference}</small></td><td><strong>{product?.name}</strong><small>{product?.sku}</small></td><td>{warehouse?.code}</td><td className={movement.type === 'IN' ? 'qty-in' : 'qty-out'}>{movement.type === 'IN' ? '+' : '−'}{movement.quantity}</td><td>{formatDate(movement.createdAt, true)}</td></tr> })}</tbody></table></div>
        </section>
        <section className="panel warehouse-panel">
          <div className="panel-header"><div><h3>Warehouse capacity</h3><p>Stock distribution by location</p></div><Building2 size={20} /></div>
          <div className="warehouse-bars">{warehouses.map((warehouse) => { const stock = products.reduce((sum, product) => sum + (product.stocks[warehouse.id] ?? 0), 0); return <div key={warehouse.id}><div><strong>{warehouse.name}</strong><span>{number.format(stock)} units</span></div><div className="capacity-track"><i style={{ width: `${(stock / maxWarehouseStock) * 100}%` }} /></div><small>{warehouse.code} · {warehouse.location}</small></div> })}</div>
          <Link to="/warehouses" className="panel-link">Manage warehouses <ArrowRight size={16} /></Link>
        </section>
      </div>
    </div>
  )
}
