import './globals.css';

export const metadata = {
  title: 'Coy Discover',
  description: 'Discover profiles, like privately, and connect when the interest is mutual.',
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
