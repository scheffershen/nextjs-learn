'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link';
import {
  GlobeAltIcon,
  EnvelopeIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button'
import { createCustomer } from '@/app/lib/customers/actions'
import { useActionState } from 'react'

export default function Form() {
  const [formAction] = useActionState(createCustomer)

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
            <label className="mb-2 block text-sm font-medium" htmlFor="name">
              Name
            </label>
            <div className="relative">
                <input
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="name"
                type="text"
                name="name"
                placeholder="Enter customer name"
                required
                />
                <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            </div>
        </div>
        <div className="mt-4">
            <label className="mb-2 block text-sm font-medium" htmlFor="email">
              Email
            </label>
            <div className="relative">
                <input
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="email"
                type="email"
                name="email"
                placeholder="Enter customer email"
                required
                />
                <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            </div>
        </div>
        <div className="mt-4">
            <label className="mb-2 block text-sm font-medium" htmlFor="imageUrl">
              Image URL (optional)
            </label>
            <input
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              id="imageUrl"
              type="url"
              name="imageUrl"
              placeholder="Enter image URL"
            />
            <GlobeAltIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/cutomers"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Create Customer</Button>
      </div>
    </form>
  )
} 