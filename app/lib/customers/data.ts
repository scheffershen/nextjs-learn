import { getClient } from '../../../scripts/mysql-local';
import { formatCurrency } from '../utils';
import { Customer, DatabaseError } from '../definitions';

const ITEMS_PER_PAGE = 6;

export async function fetchFilteredCustomers(
    query: string,
    currentPage: number
) {
 const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const client = await getClient();
    const [data] = await client.query(`
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
      LIMIT ? OFFSET ?`,
      [
        `%${query}%`,
        `%${query}%`,
        ITEMS_PER_PAGE,
        offset
      ]
    );

    //console.log('data', data);
    const customers = data.map((customer: Customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));
    //console.log('customers', customers);
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

export async function fetchCustomersPages(query: string) {
  try {
    const client = await getClient();
    const [count] = await client.query(`
      SELECT COUNT(*) as total
      FROM customers
      WHERE
        LOWER(name) LIKE LOWER(?) OR
        LOWER(email) LIKE LOWER(?)`,
      [
        `%${query}%`,
        `%${query}%`
      ]
    );

    const totalPages = Math.ceil(Number(count[0].total) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of customers.');
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