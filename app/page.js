import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Features from "../components/Features";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Navbar />
      <Hero />
      <About />
      <Features />
      <Footer />
    </main>
  );
}