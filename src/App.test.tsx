import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  window.localStorage.clear();
});

test('renders the form with its default values', () => {
  render(<App />);
  const nameInput = screen.getByRole('textbox', { name: /card name/i });
  expect(nameInput).toHaveValue('rat');
});

test('typing a mana symbol in the description renders its icon on the card preview', () => {
  render(<App />);
  // MUI multiline TextFields render a hidden shadow <textarea> alongside the
  // real one (for auto-sizing) sharing the same accessible name — the first
  // match is the visible/interactive one.
  const [descriptionInput] = screen.getAllByRole('textbox', { name: /description/i });

  fireEvent.change(descriptionInput, {
    target: { value: 'Tap: add {u} to your mana pool. {tap}' },
  });

  expect(document.body.innerHTML).toContain('ms-u');
  expect(document.body.innerHTML).toContain('ms-tap');
});
