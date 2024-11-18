'use server';

// Handles form submissions and database mutations
//Implements proper connection management
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getClient } from '../../scripts/mysql-local';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce.number().gt(0, {
        message: 'Please enter an amount greater than $0.',
    }),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string(),
})

export async function createInvoice(formData: FormData) {
    try {
        // Validate form data
        const { customerId, amount, status } = FormSchema.parse({
            customerId: formData.get('customerId'),
            amount: formData.get('amount'),
            status: formData.get('status')
        });
        
        const amountInCents = amount * 100;
        const date = new Date().toISOString().split('T')[0];

        // Get singleton connection
        const client = await getClient();

        // Use sql template literal for consistent query handling
        await client.sql`
            INSERT INTO invoices (customer_id, amount, status, date) 
            VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;

        revalidatePath('/dashboard/invoices');
        redirect('/dashboard/invoices');
    } catch (error) {
        // Handle validation and database errors appropriately
        console.error('Failed to create invoice:', error);
        throw new Error('Failed to create invoice.');
    }
}


