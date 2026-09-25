import './globals.css';import {Header} from '@/components/Header';import {Footer} from '@/components/Footer';
import { CartProvider } from '@/lib/cart';

export const metadata={title:'LIL REEM STORE',description:'Original art, commissions, and handmade creations.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><CartProvider><Header/><main>{children}</main><Footer/></CartProvider></body></html>}
