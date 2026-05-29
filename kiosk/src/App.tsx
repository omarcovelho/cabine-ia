import { useBoothPolling } from './hooks/useBoothPolling';
import { PhaseRouter } from './routing/PhaseRouter';
import './App.css';

function App() {
  const { snapshot, error } = useBoothPolling();

  if (error) {
    return <main className="app-error">Erro ao conectar com a cabine.</main>;
  }

  return <PhaseRouter phase={snapshot?.phase} />;
}

export default App;
