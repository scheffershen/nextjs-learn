import { getClient } from '../../scripts/mysql-local';
import { formatCurrency } from './utils';
import { Revenue, DatabaseError } from './definitions';

export async function fetchRevenue() {
  try {
    const client = await getClient();
    const data = await client.sql`SELECT * FROM revenue`;
    
    if (!data?.rows || data.rows.length === 0) {
      console.warn('No revenue data found in database');
      return []; 
    }

    return data.rows;
  } catch (error) {
    const dbError = error as DatabaseError;
    console.error('Database Error:', {
      message: dbError.message,
      code: dbError.code,
      stack: dbError.stack
    });
    throw new Error(`Failed to fetch revenue data: ${dbError.message}`);
  }
}

export async function fetchCardData() {
  try {
    const client = await getClient();

    const invoiceCountPromise = client.sql`
      SELECT COUNT(*) as count 
      FROM invoices
    `;

    const customerCountPromise = client.sql`
      SELECT COUNT(*) as count 
      FROM customers
    `;

    const invoiceStatusPromise = client.sql`
      SELECT 
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending
      FROM invoices
    `;

    const [invoiceCount, customerCount, invoiceStatus] = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(invoiceCount.rows[0].count ?? 0);
    const numberOfCustomers = Number(customerCount.rows[0].count ?? 0);
    const totalPaidInvoices = formatCurrency(invoiceStatus.rows[0].paid ?? 0);
    const totalPendingInvoices = formatCurrency(invoiceStatus.rows[0].pending ?? 0);

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}
