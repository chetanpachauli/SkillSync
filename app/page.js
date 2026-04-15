
import About from "./About/page";
import Features from "./features/page";
import Footer from "./footer/page";
import Hero from "./Hero/page";
import Navbar from "./Navbar/page";

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
