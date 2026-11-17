import './globals.css';

export const metadata = {
  title: 'Coy — A little curiosity. A real connection.',
  description:
    'Discover someone new. Your likes stay private until the feeling is mutual. A standalone Coy assignment demo.',
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
