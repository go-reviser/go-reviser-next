// components/Layout.tsx
import Head from 'next/head'
import { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div>
            <Head>
                <h1 className="text-xl font-bold">GOReviser</h1>
            </Head>

            <main className="p-6">{children}</main>

            <footer className="p-4 text-center text-sm text-gray-500">
                © 2025 GOReviser
            </footer>
        </div>
    )
}
