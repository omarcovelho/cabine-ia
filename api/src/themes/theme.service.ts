import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  GuestScene,
  SCENE_PROMPT_FILE,
  ThemeManifest,
  ThemePack,
  ThemeScene,
  ThemeSceneManifest,
  ThemeSummary,
} from './theme.types';

const SCENES_PER_THEME = 3;

@Injectable()
export class ThemeService {
  private readonly themesRoot = join(process.cwd(), 'themes');

  listThemeIds(): string[] {
    if (!existsSync(this.themesRoot)) {
      return [];
    }

    return readdirSync(this.themesRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((themeId) =>
        existsSync(join(this.themesRoot, themeId, 'manifest.json')),
      )
      .sort();
  }

  loadPack(themeId: string): ThemePack {
    const rootDir = join(this.themesRoot, themeId);
    const manifestPath = join(rootDir, 'manifest.json');

    if (!existsSync(manifestPath)) {
      throw new NotFoundException(`Theme pack not found: ${themeId}`);
    }

    const manifest = JSON.parse(
      readFileSync(manifestPath, 'utf8'),
    ) as ThemeManifest;

    this.validateManifest(themeId, rootDir, manifest);

    const scenes = manifest.scenes.map((scene) =>
      this.loadScene(rootDir, scene),
    );

    return {
      id: manifest.id,
      version: manifest.version,
      name: manifest.name,
      scenes,
      rootDir,
    };
  }

  toThemeSummary(pack: ThemePack): ThemeSummary {
    return {
      id: pack.id,
      name: pack.name,
    };
  }

  toGuestScenes(pack: ThemePack): GuestScene[] {
    return pack.scenes.map((scene) => ({
      id: scene.id,
      name: scene.name,
      tagline: scene.tagline,
      exampleUrl: `/themes/${pack.id}/scenes/${scene.id}/example`,
    }));
  }

  getScenePrompt(themeId: string, sceneId: string): string {
    const pack = this.loadPack(themeId);
    const scene = pack.scenes.find((entry) => entry.id === sceneId);

    if (!scene) {
      throw new NotFoundException(`Scene not found: ${themeId}/${sceneId}`);
    }

    return scene.prompt;
  }

  getExampleImagePath(themeId: string, sceneId: string): string {
    const pack = this.loadPack(themeId);
    const scene = pack.scenes.find((entry) => entry.id === sceneId);

    if (!scene) {
      throw new NotFoundException(`Scene not found: ${themeId}/${sceneId}`);
    }

    const imagePath = join(pack.rootDir, scene.exampleFile);
    if (!existsSync(imagePath)) {
      throw new NotFoundException(
        `Example image not found: ${themeId}/${sceneId}`,
      );
    }

    return imagePath;
  }

  private loadScene(rootDir: string, scene: ThemeSceneManifest): ThemeScene {
    const promptPath = join(rootDir, 'scenes', scene.id, SCENE_PROMPT_FILE);
    if (!existsSync(promptPath)) {
      throw new Error(
        `Theme scene "${scene.id}" missing prompt file: scenes/${scene.id}/${SCENE_PROMPT_FILE}`,
      );
    }

    const prompt = readFileSync(promptPath, 'utf8').trim();
    if (!prompt) {
      throw new Error(`Theme scene "${scene.id}" prompt file is empty`);
    }

    return { ...scene, prompt };
  }

  private validateManifest(
    themeId: string,
    rootDir: string,
    manifest: ThemeManifest,
  ): void {
    if (manifest.id !== themeId) {
      throw new Error(
        `Theme manifest id "${manifest.id}" does not match folder "${themeId}"`,
      );
    }

    if (manifest.scenes.length !== SCENES_PER_THEME) {
      throw new Error(
        `Theme "${themeId}" must have exactly ${SCENES_PER_THEME} scenes`,
      );
    }

    for (const scene of manifest.scenes) {
      const examplePath = join(rootDir, scene.exampleFile);
      if (!existsSync(examplePath)) {
        throw new Error(
          `Theme "${themeId}" missing example file: ${scene.exampleFile}`,
        );
      }
    }
  }
}
