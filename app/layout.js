import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "./components/themeprovider";
import { AuthProvider } from "./components/provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: "ChetanAi - AI Interview Prep & Resume Analyzer",
  description: "AI Interview Prep & Resume Analyzer",
  icons: {
    icon: "/images/c-square.png", // ✅ Corrected this line
  },
  openGraph: {
    title: "SkillSync - AI Interview Prep & Resume Builder",
    description:
      "Boost your career with SkillSync's AI-powered tools to create resumes and prepare for interviews.",
    url: "https://skillsync.vercel.app", // ✅ Replace with your actual URL if different
    siteName: "SkillSync",
    images: [
      {
        url: "/images/c-square.png",
        width: 1200,
        height: 630,
        alt: "SkillSync Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};
export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning lang="en">
      <body
  suppressHydrationWarning
  className={`bg-gradient-to-b from-white via-blue-50 to-white dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 ${geistSans.variable} ${geistMono.variable} antialiased`}
>
       <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
        {/* <Navbar /> */}
          {children}
          {/* <Footer/> */}
        </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
