import Body from './components/Body'
import Breadcrumbs from './components/Breadcrumbs';
import Header from './components/ui/Header';

function App() {
  return (
    <div className="flex flex-col min-h-screen font-medium">
      <Header />
      <main className="flex-grow bg-fixed bg-image-pattern bg-cover">
        <Breadcrumbs />
        <div className="container pt-20 pb-10">
          <div className="max-w-4xl mx-auto">
            <Body />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
