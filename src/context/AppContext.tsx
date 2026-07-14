import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { demoUsers, seedData } from '../data/seed'
import type { AppData, MovementType, Product, StockMovement, User, Warehouse } from '../types'

interface ProductInput extends Omit<Product, 'id' | 'createdAt' | 'stocks'> {
  initialWarehouseId?: string
  initialQuantity?: number
}

interface MovementInput {
  type: MovementType
  productId: string
  warehouseId: string
  quantity: number
  reference: string
  note: string
}

interface AppContextValue extends AppData {
  user: User | null
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  addProduct: (input: ProductInput) => Product
  updateProduct: (id: string, input: Partial<ProductInput>) => void
  addWarehouse: (input: Omit<Warehouse, 'id'>) => Warehouse
  addMovement: (input: MovementInput) => StockMovement
  resetDemo: () => void
}

const AppContext = createContext<AppContextValue | undefined>(undefined)
const DATA_KEY = 'stockpilot-data-v1'
const USER_KEY = 'stockpilot-user-v1'

const cloneSeed = (): AppData => JSON.parse(JSON.stringify(seedData)) as AppData

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => {
    try {
      const saved = localStorage.getItem(DATA_KEY)
      return saved ? (JSON.parse(saved) as AppData) : cloneSeed()
    } catch {
      return cloneSeed()
    }
  })
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = sessionStorage.getItem(USER_KEY)
      return saved ? (JSON.parse(saved) as User) : null
    } catch {
      return null
    }
  })

  useEffect(() => localStorage.setItem(DATA_KEY, JSON.stringify(data)), [data])
  useEffect(() => {
    if (user) sessionStorage.setItem(USER_KEY, JSON.stringify(user))
    else sessionStorage.removeItem(USER_KEY)
  }, [user])

  const login = async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 450))
    const match = demoUsers.find(
      (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase() && candidate.password === password,
    )
    if (!match) throw new Error('Invalid email or password')
    const safeUser: User = { id: match.id, name: match.name, email: match.email, role: match.role }
    setUser(safeUser)
    return safeUser
  }

  const logout = () => setUser(null)

  const addProduct = (input: ProductInput) => {
    const id = `prd-${crypto.randomUUID()}`
    const stocks: Record<string, number> = {}
    data.warehouses.forEach((warehouse) => (stocks[warehouse.id] = 0))
    if (input.initialWarehouseId && input.initialQuantity) stocks[input.initialWarehouseId] = input.initialQuantity
    const product: Product = {
      id,
      sku: input.sku.trim().toUpperCase(),
      name: input.name.trim(),
      category: input.category.trim(),
      supplier: input.supplier.trim(),
      cost: input.cost,
      price: input.price,
      reorderPoint: input.reorderPoint,
      stocks,
      createdAt: new Date().toISOString(),
    }
    setData((current) => ({ ...current, products: [product, ...current.products] }))
    return product
  }

  const updateProduct = (id: string, input: Partial<ProductInput>) => {
    setData((current) => ({
      ...current,
      products: current.products.map((product) =>
        product.id === id
          ? {
              ...product,
              ...input,
              sku: input.sku?.trim().toUpperCase() ?? product.sku,
              name: input.name?.trim() ?? product.name,
              category: input.category?.trim() ?? product.category,
              supplier: input.supplier?.trim() ?? product.supplier,
            }
          : product,
      ),
    }))
  }

  const addWarehouse = (input: Omit<Warehouse, 'id'>) => {
    const warehouse: Warehouse = { ...input, id: `wh-${crypto.randomUUID()}` }
    setData((current) => ({
      warehouses: [...current.warehouses, warehouse],
      products: current.products.map((product) => ({ ...product, stocks: { ...product.stocks, [warehouse.id]: 0 } })),
      movements: current.movements,
    }))
    return warehouse
  }

  const addMovement = (input: MovementInput) => {
    if (!user) throw new Error('You must be signed in')
    if (!Number.isFinite(input.quantity) || input.quantity <= 0) throw new Error('Quantity must be greater than zero')
    const product = data.products.find((item) => item.id === input.productId)
    if (!product) throw new Error('Product not found')
    const available = product.stocks[input.warehouseId] ?? 0
    if (input.type === 'OUT' && input.quantity > available) {
      throw new Error(`Only ${available} units are available at this warehouse`)
    }
    const movement: StockMovement = {
      id: `mov-${crypto.randomUUID()}`,
      ...input,
      performedBy: user.name,
      createdAt: new Date().toISOString(),
    }
    const change = input.type === 'IN' ? input.quantity : -input.quantity
    setData((current) => ({
      ...current,
      products: current.products.map((item) =>
        item.id === input.productId
          ? { ...item, stocks: { ...item.stocks, [input.warehouseId]: (item.stocks[input.warehouseId] ?? 0) + change } }
          : item,
      ),
      movements: [movement, ...current.movements],
    }))
    return movement
  }

  const resetDemo = () => setData(cloneSeed())

  const value = { ...data, user, login, logout, addProduct, updateProduct, addWarehouse, addMovement, resetDemo }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// The provider and its colocated hook intentionally share this module.
// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}
