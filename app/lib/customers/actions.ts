'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getClient } from '../../../scripts/mysql-local';

const CustomerSchema = z.object({
    id: z.string(),
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    image_url: z.string().url('Invalid image URL').optional()
})

const CreateCustomer = CustomerSchema.omit({ id: true });

export type CustomerState = {
    errors?: {
        name?: string[]
        email?: string[]
        image_url?: string[]
    }
    message?: string | null
}

export async function createCustomer(prevState: CustomerState, formData: FormData) {
    try {
        // Validate form fields using Zod
        const validatedFields = CreateCustomer.safeParse({
            name: formData.get('name'),
            email: formData.get('email'),
            image_url: formData.get('image_url')
        })

        // If form validation fails, return errors early
        if (!validatedFields.success) {
            return {
                errors: validatedFields.error.flatten().fieldErrors,
                message: 'Missing Fields. Failed to Create Customer.'
            }
        }

        const { name, email, image_url } = validatedFields.data;

        // Get singleton connection
        const client = await getClient()

        await client.sql`
            INSERT INTO customers (name, email, image_url)
            VALUES (${name}, ${email}, ${image_url})
        `
    } catch (error) {
        console.error('Failed to create customer:', error)
        return {
            message: 'Database Error: Failed to Create Customer.'
        }
    }

    revalidatePath('/dashboard/customers')
    redirect('/dashboard/customers')
}

export async function updateCustomer(formData: FormData) {
    try {
        const validatedFields = CustomerSchema.parse({
            id: formData.get('id'),
            name: formData.get('name'),
            email: formData.get('email'),
            image_url: formData.get('image_url')
        })

        const { id, name, email, image_url } = validatedFields;

        const client = await getClient()
        await client.sql`
            UPDATE customers
            SET name = ${name},
                email = ${email},
                image_url = ${image_url}
            WHERE id = ${id}
        `
    } catch (error) {
        console.error('Database Error:', error)
        return { message: 'Database Error: Failed to Update Customer.' }
    }

    revalidatePath('/dashboard/customers')
    redirect('/dashboard/customers')
}

export async function deleteCustomer(id: string) {
    try {
        const client = await getClient()
        await client.sql`DELETE FROM customers WHERE id = ${id}`
        revalidatePath('/dashboard/customers')
        return { message: 'Customer deleted.' }
    } catch (error) {
        console.error('Database Error:', error)
        return { message: 'Database Error: Failed to Delete Customer.' }
    }
}