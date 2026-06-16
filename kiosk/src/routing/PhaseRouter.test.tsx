import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  mockBoothSnapshot,
  mockCaptureReadySnapshot,
  mockScenePickSnapshot,
} from '../test/fixtures/boothSnapshots';
import { PhaseRouter } from './PhaseRouter';

const baseProps = {
  onStartSession: vi.fn(),
  onSelectScene: vi.fn(),
  onBack: vi.fn(),
  onOperatorEntry: vi.fn(),
};

describe('PhaseRouter', () => {
  it('renders AttractScreen when phase is attract', () => {
    render(<PhaseRouter snapshot={mockBoothSnapshot} {...baseProps} />);
    expect(screen.getByText(/Faça seu retrato cartoon/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Começar' })).toBeInTheDocument();
  });

  it('renders ScenePickerScreen when phase is scene_pick', () => {
    render(<PhaseRouter snapshot={mockScenePickSnapshot} {...baseProps} />);
    expect(screen.getByText('Escolha sua cena')).toBeInTheDocument();
    expect(screen.getByText('Praia')).toBeInTheDocument();
  });

  it('renders CaptureReadyScreen when phase is capture_ready', () => {
    render(
      <PhaseRouter snapshot={mockCaptureReadySnapshot} {...baseProps} />,
    );
    expect(screen.getByText('Cena: Praia')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tirar foto' })).toBeInTheDocument();
  });

  it('renders nothing while snapshot is undefined', () => {
    const { container } = render(
      <PhaseRouter snapshot={undefined} {...baseProps} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
