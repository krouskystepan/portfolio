import NotFoundClientLayout from '@/layouts/NotFoundClientLayout'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    absolute: 'Not Found | Stepan Krousky',
  },
  description: 'The page you are looking for does not exist.',
}

export default function NotFoundPage() {
  return <NotFoundClientLayout />
}
