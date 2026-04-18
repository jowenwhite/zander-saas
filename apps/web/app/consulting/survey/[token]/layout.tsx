import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feedback Survey | Zander Consulting',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SurveyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
