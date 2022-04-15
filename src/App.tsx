import Header from './components/Header';
import Body from './components/Body'
import Footer from './components/Footer';
import image from "./assets/images/bg-glow-top-left.png";

function App() {
  return (
    <div className="flex flex-col min-h-screen font-medium">
      <Header />
      <main className="py-4 flex-grow h-1"
        style={{ backgroundImage: `url(${image}), linear-gradient(to bottom, #272520, #1b1a18)` }}
      >
        <Body />
      </main>
    </div>
  );
}

export default App;
