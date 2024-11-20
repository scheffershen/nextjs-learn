import CreateCustomerForm from '@/app/ui/customers/create-form'
import Breadcrumbs from '@/app/ui/breadcrumbs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Customer',
}

export default function Page() {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <Breadcrumbs
          breadcrumbs={[
            { label: 'Customers', href: '/dashboard/customers' },
            { label: 'Create Customer', href: '/dashboard/customers/create', active: true },
          ]}
        />
        <CreateCustomerForm />
      </div>
    </main>
  )
} 