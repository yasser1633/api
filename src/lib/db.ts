import Dexie, { type Table } from 'dexie';

// Define interfaces for table records
export interface Customer {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  balance: number;
}

export interface Supplier {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  balance: number;
}

export interface SaleInvoice {
  id?: number;
  customerId: number;
  invoiceDate: Date;
  total: number;
  status: 'مدفوعة' | 'مدفوعة جزئياً' | 'غير مدفوعة';
  paidAmount: number;
}

export interface SaleInvoiceItem {
  id?: number;
  invoiceId: number;
  description: string;
  quantity: number;
  price: number;
}

export interface PurchaseInvoice {
  id?: number;
  supplierId: number;
  invoiceDate: Date;
  total: number;
  status: 'مدفوعة' | 'مدفوعة جزئياً' | 'غير مدفوعة';
  paidAmount: number;
}

export interface PurchaseInvoiceItem {
  id?: number;
  invoiceId: number;
  description: string;
  quantity: number;
  price: number;
}

export interface CashTransaction {
  id?: number;
  date: Date;
  type: 'in' | 'out';
  amount: number;
  description: string;
  partyType?: 'customer' | 'supplier';
  partyId?: number;
}

export interface AppSettings {
    id?: 1;
    companyName: string;
    companyAddress: string;
    taxNumber: string;
}


// Define the database class
class MySubClassedDexie extends Dexie {
  customers!: Table<Customer>;
  suppliers!: Table<Supplier>;
  saleInvoices!: Table<SaleInvoice>;
  saleInvoiceItems!: Table<SaleInvoiceItem>;
  purchaseInvoices!: Table<PurchaseInvoice>;
  purchaseInvoiceItems!: Table<PurchaseInvoiceItem>;
  cashTransactions!: Table<CashTransaction>;
  appSettings!: Table<AppSettings>;

  constructor() {
    super('accountingAppDB');
    this.version(2).stores({
      customers: '++id, name',
      suppliers: '++id, name',
      saleInvoices: '++id, customerId, invoiceDate',
      saleInvoiceItems: '++id, invoiceId',
      purchaseInvoices: '++id, supplierId, invoiceDate',
      purchaseInvoiceItems: '++id, invoiceId',
      cashTransactions: '++id, date, type, [partyType+partyId]',
      appSettings: 'id',
    });
    this.version(3).stores({
      saleInvoices: '++id, customerId, invoiceDate, status',
      purchaseInvoices: '++id, supplierId, invoiceDate, status',
    });
  }
}

export const db = new MySubClassedDexie();

// Seed initial data if necessary
db.on('populate', async () => {
    await db.appSettings.add({
        id: 1,
        companyName: 'اسم شركتك',
        companyAddress: 'عنوان شركتك',
        taxNumber: '123456789012345'
    });
    // Add some dummy customers and suppliers
    await db.customers.bulkAdd([
        { name: 'عميل نقدي', balance: 0 },
        { name: 'أحمد محمد', email: 'ahmed@example.com', phone: '0501234567', balance: 0 },
    ]);
    await db.suppliers.bulkAdd([
        { name: 'مورد نقدي', balance: 0 },
        { name: 'شركة التوريدات الحديثة', email: 'supply@example.com', phone: '0557654321', balance: 0 },
    ]);
});

db.open().catch(err => {
    console.error(`Failed to open db: ${err.stack || err}`);
});