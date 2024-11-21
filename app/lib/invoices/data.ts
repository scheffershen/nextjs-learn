import { getClient } from '../../../scripts/mysql-local';
import { formatCurrency } from '../utils';
import { DatabaseError } from '../definitions';

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

    const invoice = data[0] && {
      ...data[0],
      amount: data[0].amount / 100,
    };
    
    if (invoice[0]) {
      invoice[0].amount = Number((invoice[0].amount / 100).toFixed(2))
    }
    
    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
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

    const latestInvoices = data.rows.map((invoice: any) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));

    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
} 