import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  Boxes,
  Building2,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageSearch,
  RotateCcw,
  Search,
  Settings,
  X,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { totalStock } from '../types'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: PackageSearch },
  { to: '/warehouses', label: 'Warehouses', icon: Building2 },
  { to: '/movements', label: 'Stock movements', icon: ClipboardList },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
]

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/warehouses': 'Warehouses',
  '/movements': 'Stock movements',
  '/reports': 'Reports',
}

export function AppLayout() {
  const { user, logout, products, resetDemo } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const lowStockCount = products.filter((product) => totalStock(product) <= product.reorderPoint).length

  const doLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Boxes size={22} /></div>
          <div><strong>StockPilot</strong><span>Inventory OS</span></div>
        </div>
        <button className="icon-button sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={20} /></button>
        <nav className="main-nav" aria-label="Main navigation">
          <p className="nav-label">Workspace</p>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setMobileOpen(false)} className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
              <Icon size={19} /><span>{label}</span>
              {to === '/products' && <span className="nav-count">{products.length}</span>}
            </NavLink>
          ))}
          <p className="nav-label nav-label-spaced">System</p>
          <button className="nav-item nav-button" onClick={() => alert('Settings are reserved for the next release.')}><Settings size={19} /><span>Settings</span></button>
        </nav>
        <div className="sidebar-foot">
          <div className="storage-card">
            <div className="storage-title"><span>Inventory health</span><strong>{lowStockCount ? 'Needs attention' : 'Healthy'}</strong></div>
            <div className="progress-track"><span style={{ width: `${Math.max(18, 100 - lowStockCount * 14)}%` }} /></div>
            <small>{lowStockCount} products below reorder point</small>
          </div>
          <div className="sidebar-user">
            <div className="avatar">{user?.name.split(' ').map((part) => part[0]).join('')}</div>
            <div><strong>{user?.name}</strong><span>{user?.role === 'admin' ? 'Administrator' : 'Inventory manager'}</span></div>
            <button className="icon-button" onClick={doLogout} aria-label="Log out"><LogOut size={17} /></button>
          </div>
        </div>
      </aside>
      {mobileOpen && <button className="sidebar-backdrop" onClick={() => setMobileOpen(false)} aria-label="Close menu" />}
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
            <div><p className="eyebrow">Operations / {pageTitles[location.pathname]}</p><h1>{pageTitles[location.pathname]}</h1></div>
          </div>
          <div className="topbar-actions">
            <div className={`global-search ${searchOpen ? 'search-open' : ''}`}>
              <Search size={17} />
              <input aria-label="Search products" placeholder="Search products…" onFocus={() => setSearchOpen(true)} onBlur={() => setTimeout(() => setSearchOpen(false), 150)} />
              <kbd>⌘ K</kbd>
              {searchOpen && (
                <div className="search-results">
                  <span>Quick navigation</span>
                  {products.slice(0, 4).map((product) => <button key={product.id} onMouseDown={() => navigate(`/products?search=${encodeURIComponent(product.name)}`)}>{product.name}<small>{product.sku}</small></button>)}
                </div>
              )}
            </div>
            <button className="icon-button notification-button" onClick={() => navigate('/reports?tab=low-stock')} aria-label="Low-stock alerts"><Bell size={19} />{lowStockCount > 0 && <span>{lowStockCount}</span>}</button>
            <div className="profile-menu-wrap">
              <button className="profile-button" onClick={() => setProfileOpen((open) => !open)}><div className="avatar small">{user?.name[0]}</div><ChevronDown size={16} /></button>
              {profileOpen && <div className="profile-menu"><strong>{user?.name}</strong><span>{user?.email}</span><button onClick={() => { resetDemo(); setProfileOpen(false) }}><RotateCcw size={15} /> Reset demo data</button><button onClick={doLogout}><LogOut size={15} /> Log out</button></div>}
            </div>
          </div>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  )
}
