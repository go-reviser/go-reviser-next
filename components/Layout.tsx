// components/Layout.tsx
import { ReactNode } from 'react'
import Header from './Header'

interface LayoutProps {
    children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="min-h-screen flex flex-col">
            <div className="fixed top-0 left-0 right-0 z-50">
                <Header />
            </div>
            <main className="flex-1 pt-[72px]">
                {children}
            </main>
        </div>
    )
}

export default Layout
