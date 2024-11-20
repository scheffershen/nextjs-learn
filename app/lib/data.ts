import { getClient } from '../../scripts/mysql-local';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';

interface DatabaseError extends Error {
  code?: string;
  errno?: number;
  sqlState?: string;
  sqlMessage?: string;
}

interface Customer extends CustomerField {
  total_pending: number;
  total_paid: number;
}

export async function fetchRevenue() {
  try {
    //console.log('Fetching revenue data...');
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

export async function fetchLatestInvoices() {
  try {
    const client = await getClient();
    const data = await client.sql`
      SELECT 
        i.amount, 
        c.name, 
        c.image_url, 
        c.email, 
        i.id
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      ORDER BY i.date DESC
      LIMIT 5
    `;

    interface Invoice {
      amount: number;
      name: string;
      image_url: string;
      email: string;
      id: string;
    }

    const latestInvoices = data.rows.map((invoice: Invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));

    return latestInvoices;
  } catch (error) {
    const dbError = error as DatabaseError;
    console.error('Database Error:', dbError);
    throw new Error('Failed to fetch the latest invoices.');
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

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const client = await getClient();
    const invoices = await client.query(`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        LOWER(customers.name) LIKE LOWER(?) OR
        LOWER(customers.email) LIKE LOWER(?) OR
        LOWER(CAST(invoices.amount AS CHAR)) LIKE LOWER(?) OR
        LOWER(CAST(invoices.date AS CHAR)) LIKE LOWER(?) OR
        LOWER(invoices.status) LIKE LOWER(?)
      ORDER BY invoices.date DESC
      LIMIT ? OFFSET ?`,
      [
        `%${query}%`,
        `%${query}%`,
        `%${query}%`,
        `%${query}%`,
        `%${query}%`,
        ITEMS_PER_PAGE,
        offset
      ]
    );

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const client = await getClient();
    const [count] = await client.query(`
      SELECT COUNT(*) as total
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        LOWER(customers.name) LIKE LOWER(?) OR
        LOWER(customers.email) LIKE LOWER(?) OR
        LOWER(CAST(invoices.amount AS CHAR)) LIKE LOWER(?) OR
        LOWER(CAST(invoices.date AS CHAR)) LIKE LOWER(?) OR
        LOWER(invoices.status) LIKE LOWER(?)`,
      [
        `%${query}%`,
        `%${query}%`,
        `%${query}%`,
        `%${query}%`,
        `%${query}%`
      ]
    );

    const totalPages = Math.ceil(Number(count[0].total) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  console.log(id);
  try {
    const client = await getClient();
    // MySQL version - using parameterized query
    const data = await client.query(`
      SELECT
        invoices.id,
        invoices.customer_id, 
        invoices.amount,
        invoices.status
      FROM invoices 
      WHERE invoices.id = ?`,
      [id]
    );

    // MySQL returns array of rows directly
    const invoice = data[0] && {
      ...data[0],
      // Convert amount from cents to dollars
      amount: data[0].amount / 100,
    };
    
    if (invoice[0]) {
      invoice[0].amount = Number((invoice[0].amount / 100).toFixed(2))
    }

    // log the invoice
    console.log(invoice[0]);
    
    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const client = await getClient();
    const [customers] = await client.query(`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `);

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const client = await getClient();
    const data = await client.sql`
      SELECT
        customers.id,
        customers.name,
        customers.email,
        customers.image_url,
        COUNT(invoices.id) AS total_invoices,
        SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
        SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
      FROM customers
      LEFT JOIN invoices ON customers.id = invoices.customer_id
      WHERE
        customers.name LIKE ${`%${query}%`} OR
        customers.email LIKE ${`%${query}%`}
      GROUP BY customers.id, customers.name, customers.email, customers.image_url
      ORDER BY customers.name ASC
    `;

    const customers = data.rows.map((customer: Customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}
