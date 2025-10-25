import Dexie, { type Table } from 'dexie';

export interface Customer {
  id?: number;
  name: string;
  email: string;
  phone: string;
  balance: number;
}

export interface Supplier {
  id?: number;
  name: string;
  email: string;
  phone: string;
  balance: number;
}

export interface SaleInvoice {
  id?: number;
  customerId: number;
  invoiceDate: Date;
  total: number;
  status: 'مدفوعة' | 'غير مدفوعة' | 'متأخرة';
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
  status: 'مدفوعة' | 'غير مدفوعة' | 'متأخرة';
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
  transactionDate: Date;
  type: 'in' | 'out';
  amount: number;
  description: string;
  partyType?: 'customer' | 'supplier';
  partyId?: number;
  partyName?: string;
}

export interface AppSettings {
  id?: number; // Will always be 1
  companyName: string;
  companyAddress: string;
  taxNumber: string;
}

export class AppDatabase extends Dexie {
  customers!: Table<Customer>;
  suppliers!: Table<Supplier>;
  saleInvoices!: Table<SaleInvoice>;
  saleInvoiceItems!: Table<SaleInvoiceItem>;
  purchaseInvoices!: Table<PurchaseInvoice>;
  purchaseInvoiceItems!: Table<PurchaseInvoiceItem>;
  cashTransactions!: Table<CashTransaction>;
  appSettings!: Table<AppSettings>;

  constructor() {
    super('AccountingAppDB');
    this.version(1).stores({
      customers: '++id, name',
      suppliers: '++id, name',
      saleInvoices: '++id, customerId, invoiceDate',
      saleInvoiceItems: '++id, invoiceId',
    });
    this.version(2).stores({
      customers: '++id, name',
      suppliers: '++id, name',
      saleInvoices: '++id, customerId, invoiceDate',
      saleInvoiceItems: '++id, invoiceId',
      cashTransactions: '++id, transactionDate, type',
    });
    this.version(3).stores({
      customers: '++id, name',
      suppliers: '++id, name',
      saleInvoices: '++id, customerId, invoiceDate',
      saleInvoiceItems: '++id, invoiceId',
      cashTransactions: '++id, transactionDate, type',
      purchaseInvoices: '++id, supplierId, invoiceDate',
      purchaseInvoiceItems: '++id, invoiceId',
    });
    this.version(4).stores({
      customers: '++id, name',
      suppliers: '++id, name',
      saleInvoices: '++id, customerId, invoiceDate',
      saleInvoiceItems: '++id, invoiceId',
      cashTransactions: '++id, transactionDate, type',
      purchaseInvoices: '++id, supplierId, invoiceDate',
      purchaseInvoiceItems: '++id, invoiceId',
      appSettings: 'id',
    });
  }
}

export const db = new AppDatabase();