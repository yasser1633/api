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

export class AppDatabase extends Dexie {
  customers!: Table<Customer>;
  suppliers!: Table<Supplier>;
  saleInvoices!: Table<SaleInvoice>;
  saleInvoiceItems!: Table<SaleInvoiceItem>;

  constructor() {
    super('AccountingAppDB');
    this.version(1).stores({
      customers: '++id, name', // ++id is auto-incrementing primary key, name is indexed
      suppliers: '++id, name',
      saleInvoices: '++id, customerId, invoiceDate',
      saleInvoiceItems: '++id, invoiceId',
    });
  }
}

export const db = new AppDatabase();