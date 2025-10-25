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

export class AppDatabase extends Dexie {
  customers!: Table<Customer>;
  suppliers!: Table<Supplier>;
  saleInvoices!: Table<SaleInvoice>;
  saleInvoiceItems!: Table<SaleInvoiceItem>;
  cashTransactions!: Table<CashTransaction>;

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
    }).upgrade(tx => {
      // This upgrade function is needed for Dexie v3+ when adding tables to an existing db.
      // It can be empty if we're just adding a new table.
      return tx.table("cashTransactions").count();
    });
  }
}

export const db = new AppDatabase();