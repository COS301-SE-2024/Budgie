import './global.css';
import styles from './page.module.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Budgie',
  description: 'Budgie financial app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-BudgieWhite">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
