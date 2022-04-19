import Header from './components/Header';
import Body from './components/Body'

function App() {
  return (
    <div className="flex flex-col min-h-screen font-medium">
      <Header />
      <main className="flex-grow bg-image-pattern"
      >
        <Body />
      </main>
    </div>
  );
}

export default App;
