import type { Metadata } from 'next';
import ThemeRegistry from '@/theme/ThemeRegistry';
import ReduxProvider from '@/store/ReduxProvider';
import AppLayout from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'Smart Clinic Management System & Patient Portal',
  description: 'Next.js + MUI + Formik + Yup + RTK clinical application platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ReduxProvider>
          <ThemeRegistry>
            <AppLayout>{children}</AppLayout>
          </ThemeRegistry>
        </ReduxProvider>
      </body>
    </html>
  );
}
