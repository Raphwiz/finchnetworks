import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Finch Networks Ltd | Secure. Connect. Empower.',icons:{icon:'/finch-logo.png'},description:'CCTV, electric fences, automatic gates, office networking and Starlink. Explore Finch Networks services and build your project estimate.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}

