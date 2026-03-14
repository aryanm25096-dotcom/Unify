export const metadata = {
  title: 'FreelanceAI',
  description: 'AI-powered Freelance Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
