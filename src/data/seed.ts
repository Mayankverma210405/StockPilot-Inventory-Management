import type { AppData, User } from '../types'

export const demoUsers: Array<User & { password: string }> = [
  { id: 'usr-1', name: 'Alex Morgan', email: 'admin@stockpilot.io', password: 'admin123', role: 'admin' },
  { id: 'usr-2', name: 'Maya Chen', email: 'manager@stockpilot.io', password: 'manager123', role: 'inventory-manager' },
]

export const seedData: AppData = {
  warehouses: [
    { id: 'wh-1', code: 'NYC-01', name: 'East Coast Hub', location: 'Brooklyn, New York', manager: 'Maya Chen' },
    { id: 'wh-2', code: 'DAL-01', name: 'Central Distribution', location: 'Dallas, Texas', manager: 'Noah Williams' },
    { id: 'wh-3', code: 'LAX-01', name: 'West Coast Hub', location: 'Los Angeles, California', manager: 'Sophia Davis' },
  ],
  products: [
    { id: 'prd-1', sku: 'ELEC-1042', name: 'Wireless Barcode Scanner', category: 'Electronics', supplier: 'ScanTech Supply', cost: 72, price: 119, reorderPoint: 25, stocks: { 'wh-1': 36, 'wh-2': 18, 'wh-3': 22 }, createdAt: '2026-04-12T10:00:00.000Z' },
    { id: 'prd-2', sku: 'OFF-2240', name: 'Thermal Label Roll (500)', category: 'Office Supplies', supplier: 'Paperworks Co.', cost: 8.5, price: 17, reorderPoint: 80, stocks: { 'wh-1': 120, 'wh-2': 95, 'wh-3': 62 }, createdAt: '2026-04-15T10:00:00.000Z' },
    { id: 'prd-3', sku: 'SAFE-3811', name: 'High-Visibility Safety Vest', category: 'Safety', supplier: 'SafeWear Industries', cost: 11, price: 24, reorderPoint: 40, stocks: { 'wh-1': 12, 'wh-2': 8, 'wh-3': 6 }, createdAt: '2026-05-03T10:00:00.000Z' },
    { id: 'prd-4', sku: 'PACK-4450', name: 'Heavy Duty Packing Tape', category: 'Packaging', supplier: 'PackRight', cost: 3.2, price: 8, reorderPoint: 100, stocks: { 'wh-1': 210, 'wh-2': 160, 'wh-3': 190 }, createdAt: '2026-05-09T10:00:00.000Z' },
    { id: 'prd-5', sku: 'ELEC-5199', name: 'Rugged Warehouse Tablet', category: 'Electronics', supplier: 'Vertex Devices', cost: 318, price: 499, reorderPoint: 12, stocks: { 'wh-1': 7, 'wh-2': 3, 'wh-3': 1 }, createdAt: '2026-05-21T10:00:00.000Z' },
    { id: 'prd-6', sku: 'EQUIP-6104', name: 'Platform Hand Truck', category: 'Equipment', supplier: 'LiftLine Tools', cost: 124, price: 219, reorderPoint: 10, stocks: { 'wh-1': 15, 'wh-2': 11, 'wh-3': 9 }, createdAt: '2026-06-04T10:00:00.000Z' },
    { id: 'prd-7', sku: 'PACK-7022', name: 'Kraft Shipping Box — Large', category: 'Packaging', supplier: 'PackRight', cost: 1.8, price: 4.5, reorderPoint: 150, stocks: { 'wh-1': 54, 'wh-2': 42, 'wh-3': 31 }, createdAt: '2026-06-12T10:00:00.000Z' },
    { id: 'prd-8', sku: 'SAFE-8201', name: 'Nitrile Work Gloves (100)', category: 'Safety', supplier: 'SafeWear Industries', cost: 14, price: 29, reorderPoint: 45, stocks: { 'wh-1': 49, 'wh-2': 37, 'wh-3': 28 }, createdAt: '2026-06-18T10:00:00.000Z' },
  ],
  movements: [
    { id: 'mov-1', type: 'IN', productId: 'prd-1', warehouseId: 'wh-1', quantity: 24, reference: 'PO-2026-0891', note: 'Supplier delivery', performedBy: 'Maya Chen', createdAt: '2026-07-14T08:42:00.000Z' },
    { id: 'mov-2', type: 'OUT', productId: 'prd-4', warehouseId: 'wh-2', quantity: 30, reference: 'SO-2026-4412', note: 'Customer shipment', performedBy: 'Alex Morgan', createdAt: '2026-07-14T07:18:00.000Z' },
    { id: 'mov-3', type: 'OUT', productId: 'prd-3', warehouseId: 'wh-1', quantity: 10, reference: 'SO-2026-4408', note: 'Internal dispatch', performedBy: 'Maya Chen', createdAt: '2026-07-13T15:24:00.000Z' },
    { id: 'mov-4', type: 'IN', productId: 'prd-2', warehouseId: 'wh-3', quantity: 75, reference: 'PO-2026-0884', note: 'Replenishment', performedBy: 'Sophia Davis', createdAt: '2026-07-13T11:05:00.000Z' },
    { id: 'mov-5', type: 'OUT', productId: 'prd-5', warehouseId: 'wh-2', quantity: 2, reference: 'SO-2026-4391', note: 'Priority order', performedBy: 'Noah Williams', createdAt: '2026-07-12T16:32:00.000Z' },
    { id: 'mov-6', type: 'IN', productId: 'prd-8', warehouseId: 'wh-1', quantity: 40, reference: 'PO-2026-0879', note: 'Supplier delivery', performedBy: 'Maya Chen', createdAt: '2026-07-12T10:14:00.000Z' },
  ],
}
