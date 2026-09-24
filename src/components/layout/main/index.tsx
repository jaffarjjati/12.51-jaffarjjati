import Header from "@/components/layout/main/header";
import Footer from "@/components/layout/main/footer";
import { ThemeProvider } from "@/context/ThemeContext";
import SafeHydrate from "@/components/hooks/SafeHydrate";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <SafeHydrate>
        <div className="relative w-full min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 md:px-16">
            {children}
          </main>
          <Footer />
        </div>
      </SafeHydrate>
    </ThemeProvider>
  );
};

export default Layout;
