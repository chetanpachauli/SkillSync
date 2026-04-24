
import About from "./about/page";
import Features from "./features/page";
import Footer from "./footer/page";
import Hero from "./hero/page";
import Navbar from "./navbar/page";

export default function Home() {
  return (
    <div className="overflow-hidden "> 
    <Navbar/>
    <Hero/>
    <About/>
    <Features/>
    <Footer/>
    </div>
  );
}
