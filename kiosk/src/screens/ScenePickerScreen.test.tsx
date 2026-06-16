import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { mockScenePickSnapshot } from '../test/fixtures/boothSnapshots';
import { ScenePickerScreen } from './ScenePickerScreen';

describe('ScenePickerScreen', () => {
  it('renders scene cards from snapshot', () => {
    render(
      <ScenePickerScreen
        scenes={mockScenePickSnapshot.scenes}
        onSelectScene={vi.fn()}
      />,
    );

    expect(screen.getByText('Escolha sua cena')).toBeInTheDocument();
    expect(screen.getByText('Praia')).toBeInTheDocument();
    expect(screen.getByText('Cidade')).toBeInTheDocument();
    expect(screen.getByText('Floresta')).toBeInTheDocument();
  });

  it('loads scene example images through the api proxy', () => {
    render(
      <ScenePickerScreen
        scenes={mockScenePickSnapshot.scenes}
        onSelectScene={vi.fn()}
      />,
    );

    expect(screen.getByRole('img', { name: 'Praia' })).toHaveAttribute(
      'src',
      '/api/themes/stub-a/scenes/beach/example',
    );
  });

  it('calls onSelectScene when a card is tapped', async () => {
    const user = userEvent.setup();
    const onSelectScene = vi.fn();

    render(
      <ScenePickerScreen
        scenes={mockScenePickSnapshot.scenes}
        onSelectScene={onSelectScene}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Praia/i }));

    expect(onSelectScene).toHaveBeenCalledWith('beach');
  });
});
