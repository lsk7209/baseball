import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "KBO HUB - 야구에 미친 사람들의 공간",
    template: "%s | KBO HUB",
  },
  description: "KBO 야구 뉴스, 심층 분석, 가십, 그리고 팬들과 함께하는 열정적인 토론 커뮤니티",
  keywords: ["KBO", "야구", "프로야구", "야구 팬", "커뮤니티", "야구 분석", "크보"],
  authors: [{ name: "KBO HUB Team" }],
  creator: "KBO HUB",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://kbo-hub.vercel.app",
    title: "KBO HUB - 야구에 미친 사람들의 공간",
    description: "야덕들의 성지, KBO HUB. 뉴스부터 뒷담화까지.",
    siteName: "KBO HUB",
    images: [
      {
        url: "/og-image.png", // public 폴더에 이미지 추가 필요
        width: 1200,
        height: 630,
        alt: "KBO HUB Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KBO HUB",
    description: "야구에 미친 사람들의 진짜 이야기",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className="antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
