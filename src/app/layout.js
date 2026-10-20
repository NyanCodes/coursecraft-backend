import "./globals.css";

export const metadata = {
  title: "Coursecraft API",
  description: "Online Course Service backend API",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
