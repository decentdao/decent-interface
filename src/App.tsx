import Header from './components/Header';
import Body from './components/Body'
import Footer from './components/Footer';

function App() {
  return (
    <div className="flex flex-col min-h-screen font-medium">
      <Header />
      <main className="py-4 container flex-grow">
        <Body />
      </main>
      <Footer />
    </div>
  );
}

export default App;
