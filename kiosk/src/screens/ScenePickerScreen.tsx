import type { GuestScene } from '../types/booth';
import { toApiUrl } from '../api/apiUrl';

type ScenePickerScreenProps = {
  scenes: GuestScene[];
  onSelectScene: (sceneId: string) => void;
  isSelecting?: boolean;
};

export function ScenePickerScreen({
  scenes,
  onSelectScene,
  isSelecting = false,
}: ScenePickerScreenProps) {
  return (
    <main className="scene-picker-screen">
      <h1>Escolha sua cena</h1>
      <div className="scene-grid">
        {scenes.map((scene) => (
          <button
            key={scene.id}
            type="button"
            className="scene-card"
            disabled={isSelecting}
            onClick={() => onSelectScene(scene.id)}
          >
            <img src={toApiUrl(scene.exampleUrl)} alt={scene.name} />
            <span>{scene.name}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
