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

export async function fetchRevenue() {
  try {
    console.log('Fetching revenue data...');
    
    const client = await getClient();
    
    // Add debugging for client connection
    console.log('Database client connected:', !!client);
    
    // MySQL version with better error handling and debugging
    const data = await client.query('SELECT * FROM revenue');
    
    // Debug the response
    console.log('Revenue data received:', {
      rowCount: data?.length,
      firstRow: data?.[0],
      isArray: Array.isArray(data)
    });

    // Validate data
    if (!data || data.length === 0) {
      console.warn('No revenue data found in database');
      return []; // Return empty array instead of null/undefined
    }

    console.log('Data fetch completed successfully');
    return data;
    
  } catch (error) {
    // Enhanced error logging
    console.error('Database Error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw new Error(`Failed to fetch revenue data: ${error.message}`);
  } finally {
    // Optional: Close client connection if needed
    // await client?.end();
  }
}

export async function fetchLatestInvoices() {
  try {
    console.log('Fetching latest invoice data...');
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const client = await getClient();
    // MySQL version - using parameterized query
    const data = await client.query(`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`
    );

    console.log('Latest invoices:', data)

    const latestInvoices = data[0].map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    console.log('Data fetch completed after 5 seconds.');

    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() { //Parallel data fetching
  try {
    console.log('Fetching card data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const client = await getClient();
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = client.query`
      SELECT COALESCE(COUNT(*), 0) as total 
      FROM invoices`;

    const customerCountPromise = client.query`
      SELECT COALESCE(COUNT(*), 0) as total 
      FROM customers`;

    // Optimize the status query using conditional aggregation
    const invoiceStatusPromise = client.query`
      SELECT 
        COALESCE(SUM(IF(status = 'paid', amount, 0)), 0) AS paid,
        COALESCE(SUM(IF(status = 'pending', amount, 0)), 0) AS pending
      FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    // Use the explicit column names from our queries
    const numberOfInvoices = Number(data[0].rows[0].total);
    const numberOfCustomers = Number(data[1].rows[0].total);
    const totalPaidInvoices = formatCurrency(data[2].rows[0].paid);
    const totalPendingInvoices = formatCurrency(data[2].rows[0].pending);

    console.log('Data fetch completed after 3 seconds.');

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
  try {
    const client = await getClient();
    const data = await client.query<InvoiceForm>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

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
    // MySQL version - using LIKE instead of ILIKE and proper parameterization
    const data = await client.query(`
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
        customers.name LIKE ? OR
        customers.email LIKE ?
      GROUP BY customers.id, customers.name, customers.email, customers.image_url
      ORDER BY customers.name ASC
    `, [`%${query}%`, `%${query}%`]);

    const customers = data.map((customer) => ({
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
