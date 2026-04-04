import Hero from "@/components/sections/home/Hero";
import About from "@/components/sections/home/About";
import LatestWork from "@/components/sections/home/LatestWork";
import StickmanScene from "@/components/three/StickmanScene";

const Home = () => {
  return (
    <>
      <StickmanScene />
      <div>
        <section>
          <Hero />
        </section>
        <section>
          <About />
        </section>
        <section>
          <LatestWork />
        </section>
      </div>
    </>
  );
};

export default Home;
