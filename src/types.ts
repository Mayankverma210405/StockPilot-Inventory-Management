export type Role = 'admin' | 'inventory-manager'

export interface User {
  id: string
  name: string
  email: string
  role: Role
}

export interface Warehouse {
  id: string
  code: string
  name: string
  location: string
  manager: string
}

export interface Product {
  id: string
  sku: string
  name: string
  category: string
  supplier: string
  cost: number
  price: number
  reorderPoint: number
  stocks: Record<string, number>
  createdAt: string
}

export type MovementType = 'IN' | 'OUT'

export interface StockMovement {
  id: string
  type: MovementType
  productId: string
  warehouseId: string
  quantity: number
  reference: string
  note: string
  performedBy: string
  createdAt: string
}

export interface AppData {
  products: Product[]
  warehouses: Warehouse[]
  movements: StockMovement[]
}

export const totalStock = (product: Product) =>
  Object.values(product.stocks).reduce((sum, quantity) => sum + quantity, 0)
