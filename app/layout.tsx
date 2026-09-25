import './globals.css';import {Header} from '@/components/Header';import {Footer} from '@/components/Footer';
export const metadata={title:'LIL REEM STORE',description:'Original art, commissions, and handmade creations.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Header/><main>{children}</main><Footer/></body></html>}
