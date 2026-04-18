import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Review Deliverable | Zander Consulting',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
