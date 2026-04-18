import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Operating Simply Consulting | Zander Systems',
  description: 'Expert guidance to organize, optimize, and grow your business. Private consulting services by Jonathan White.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function ConsultingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
