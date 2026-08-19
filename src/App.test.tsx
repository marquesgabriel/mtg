import { render, fireEvent } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  window.localStorage.clear();
});

test('renders the form with its default values', () => {
  const { container } = render(<App />);
  const nameInput = container.querySelector('#name') as HTMLInputElement;
  expect(nameInput.value).toBe('rat');
});

test('typing a mana symbol in the description renders its icon on the card preview', () => {
  const { container } = render(<App />);
  const descriptionInput = container.querySelector('#description') as HTMLTextAreaElement;
  expect(descriptionInput).not.toBeNull();

  fireEvent.change(descriptionInput, { target: { value: 'Tap: add {u} to your mana pool. {tap}' } });

  expect(container.querySelector('i.ms-u')).not.toBeNull();
  expect(container.querySelector('i.ms-tap')).not.toBeNull();
});
