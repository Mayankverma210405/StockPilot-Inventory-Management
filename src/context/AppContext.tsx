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

const cloneSeed = (): AppData =>
  JSON.parse(JSON.stringify(seedData)) as AppData

function requiredText(value: string, field: string) {
  const cleaned = value.trim()

  if (!cleaned) {
    throw new Error(`${field} is required`)
  }

  return cleaned
}

function validNonNegativeNumber(value: number, field: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be zero or greater`)
  }
}

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

  useEffect(() => {
    localStorage.setItem(DATA_KEY, JSON.stringify(data))
  }, [data])

  useEffect(() => {
    if (user) {
      sessionStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      sessionStorage.removeItem(USER_KEY)
    }
  }, [user])

  const login = async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 450))

    const match = demoUsers.find(
      (candidate) =>
        candidate.email.toLowerCase() === email.trim().toLowerCase() &&
        candidate.password === password,
    )

    if (!match) {
      throw new Error('Invalid email or password')
    }

    const safeUser: User = {
      id: match.id,
      name: match.name,
      email: match.email,
      role: match.role,
    }

    setUser(safeUser)
    return safeUser
  }

  const logout = () => setUser(null)

  const addProduct = (input: ProductInput) => {
    if (!user) {
      throw new Error('You must be signed in')
    }

    const sku = requiredText(input.sku, 'SKU').toUpperCase()
    const name = requiredText(input.name, 'Product name')
    const category = requiredText(input.category, 'Category')
    const supplier = requiredText(input.supplier, 'Supplier')

    if (
      data.products.some(
        (product) => product.sku.toLowerCase() === sku.toLowerCase(),
      )
    ) {
      throw new Error('This SKU is already in use')
    }

    validNonNegativeNumber(input.cost, 'Unit cost')
    validNonNegativeNumber(input.price, 'Selling price')
    validNonNegativeNumber(input.reorderPoint, 'Reorder point')

    if (input.price < input.cost) {
      throw new Error('Selling price cannot be lower than unit cost')
    }

    const openingQuantity = input.initialQuantity ?? 0

    if (!Number.isInteger(openingQuantity) || openingQuantity < 0) {
      throw new Error('Opening quantity must be a whole number of zero or greater')
    }

    if (
      input.initialWarehouseId &&
      !data.warehouses.some(
        (warehouse) => warehouse.id === input.initialWarehouseId,
      )
    ) {
      throw new Error('Selected warehouse was not found')
    }

    if (openingQuantity > 0 && !input.initialWarehouseId) {
      throw new Error('Select a warehouse for the opening inventory')
    }

    const id = `prd-${crypto.randomUUID()}`
    const createdAt = new Date().toISOString()
    const stocks: Record<string, number> = {}

    data.warehouses.forEach((warehouse) => {
      stocks[warehouse.id] = 0
    })

    if (input.initialWarehouseId && openingQuantity > 0) {
      stocks[input.initialWarehouseId] = openingQuantity
    }

    const product: Product = {
      id,
      sku,
      name,
      category,
      supplier,
      cost: input.cost,
      price: input.price,
      reorderPoint: input.reorderPoint,
      stocks,
      createdAt,
    }

    const openingMovement: StockMovement | null =
      input.initialWarehouseId && openingQuantity > 0
        ? {
            id: `mov-${crypto.randomUUID()}`,
            type: 'IN',
            productId: id,
            warehouseId: input.initialWarehouseId,
            quantity: openingQuantity,
            reference: `OPENING-${sku}`,
            note: 'Opening inventory recorded during product creation',
            performedBy: user.name,
            createdAt,
          }
        : null

    setData((current) => ({
      ...current,
      products: [product, ...current.products],
      movements: openingMovement
        ? [openingMovement, ...current.movements]
        : current.movements,
    }))

    return product
  }

  const updateProduct = (id: string, input: Partial<ProductInput>) => {
    if (!user) {
      throw new Error('You must be signed in')
    }

    const existing = data.products.find((product) => product.id === id)

    if (!existing) {
      throw new Error('Product not found')
    }

    const sku = input.sku
      ? requiredText(input.sku, 'SKU').toUpperCase()
      : existing.sku

    const name = input.name
      ? requiredText(input.name, 'Product name')
      : existing.name

    const category = input.category
      ? requiredText(input.category, 'Category')
      : existing.category

    const supplier = input.supplier
      ? requiredText(input.supplier, 'Supplier')
      : existing.supplier

    const cost = input.cost ?? existing.cost
    const price = input.price ?? existing.price
    const reorderPoint = input.reorderPoint ?? existing.reorderPoint

    if (
      data.products.some(
        (product) =>
          product.id !== id &&
          product.sku.toLowerCase() === sku.toLowerCase(),
      )
    ) {
      throw new Error('This SKU is already in use')
    }

    validNonNegativeNumber(cost, 'Unit cost')
    validNonNegativeNumber(price, 'Selling price')
    validNonNegativeNumber(reorderPoint, 'Reorder point')

    if (price < cost) {
      throw new Error('Selling price cannot be lower than unit cost')
    }

    setData((current) => ({
      ...current,
      products: current.products.map((product) =>
        product.id === id
          ? {
              ...product,
              sku,
              name,
              category,
              supplier,
              cost,
              price,
              reorderPoint,
            }
          : product,
      ),
    }))
  }

  const addWarehouse = (input: Omit<Warehouse, 'id'>) => {
    if (!user) {
      throw new Error('You must be signed in')
    }

    if (user.role !== 'admin') {
      throw new Error('Only administrators can create warehouses')
    }

    const code = requiredText(input.code, 'Warehouse code').toUpperCase()
    const name = requiredText(input.name, 'Warehouse name')
    const location = requiredText(input.location, 'Location')
    const manager = requiredText(input.manager, 'Manager')

    if (
      data.warehouses.some(
        (warehouse) => warehouse.code.toLowerCase() === code.toLowerCase(),
      )
    ) {
      throw new Error('This warehouse code is already in use')
    }

    const warehouse: Warehouse = {
      id: `wh-${crypto.randomUUID()}`,
      code,
      name,
      location,
      manager,
    }

    setData((current) => ({
      warehouses: [...current.warehouses, warehouse],
      products: current.products.map((product) => ({
        ...product,
        stocks: {
          ...product.stocks,
          [warehouse.id]: 0,
        },
      })),
      movements: current.movements,
    }))

    return warehouse
  }

  const addMovement = (input: MovementInput) => {
    if (!user) {
      throw new Error('You must be signed in')
    }

    if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
      throw new Error('Quantity must be a whole number greater than zero')
    }

    const product = data.products.find(
      (item) => item.id === input.productId,
    )

    if (!product) {
      throw new Error('Product not found')
    }

    const warehouse = data.warehouses.find(
      (item) => item.id === input.warehouseId,
    )

    if (!warehouse) {
      throw new Error('Warehouse not found')
    }

    const reference = requiredText(input.reference, 'Reference number')
    const note = requiredText(input.note, 'Note')
    const available = product.stocks[warehouse.id] ?? 0

    if (input.type === 'OUT' && input.quantity > available) {
      throw new Error(
        `Only ${available} units are available at this warehouse`,
      )
    }

    const movement: StockMovement = {
      id: `mov-${crypto.randomUUID()}`,
      type: input.type,
      productId: product.id,
      warehouseId: warehouse.id,
      quantity: input.quantity,
      reference,
      note,
      performedBy: user.name,
      createdAt: new Date().toISOString(),
    }

    const change = input.type === 'IN'
      ? input.quantity
      : -input.quantity

    setData((current) => ({
      ...current,
      products: current.products.map((item) =>
        item.id === product.id
          ? {
              ...item,
              stocks: {
                ...item.stocks,
                [warehouse.id]:
                  (item.stocks[warehouse.id] ?? 0) + change,
              },
            }
          : item,
      ),
      movements: [movement, ...current.movements],
    }))

    return movement
  }

  const resetDemo = () => setData(cloneSeed())

  const value: AppContextValue = {
    ...data,
    user,
    login,
    logout,
    addProduct,
    updateProduct,
    addWarehouse,
    addMovement,
    resetDemo,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error('useApp must be used inside AppProvider')
  }

  return context
}
