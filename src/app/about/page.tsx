import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-primary text-white">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <section className="space-y-6 max-w-3xl">
          <h2 className="text-4xl md:text-6xl font-bold">About Me</h2>
          <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
            Hi, I’m Philip Vishnevsky, a passionate software developer and tech enthusiast. 
            I love exploring cutting-edge technologies and applying them to solve real-world problems. 
            My journey in Computer Science has been fueled by curiosity and a deep desire to create 
            impactful projects.
          </p>
          <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
            Beyond coding, I enjoy tinkering with computers, working out, and exploring creative hobbies. 
            My goal is to constantly learn, grow, and share my knowledge with others.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}