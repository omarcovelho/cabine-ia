export interface ThemeSceneManifest {
  id: string;
  name: string;
  tagline: string | null;
  exampleFile: string;
}

export interface ThemeManifest {
  id: string;
  version: string;
  name: string;
  scenes: ThemeSceneManifest[];
}

/** Loaded scene with server-only prompt from `scenes/<id>/prompt.txt`. */
export interface ThemeScene extends ThemeSceneManifest {
  prompt: string;
}

export interface ThemePack {
  id: string;
  version: string;
  name: string;
  scenes: ThemeScene[];
  rootDir: string;
}

export interface ThemeSummary {
  id: string;
  name: string;
}

export interface GuestScene {
  id: string;
  name: string;
  tagline: string | null;
  exampleUrl: string;
}

export const SCENE_PROMPT_FILE = 'prompt.txt';
