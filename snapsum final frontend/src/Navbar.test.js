import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import NavBar from './NavBar';
import { get_playlist, get_video_list } from './api/useApi';

jest.mock('./api/useApi', () => ({
  get_playlist: jest.fn(),
  get_video_list: jest.fn(),
}));

describe('NavBar component', () => {
  test('renders properly', () => {
    const { getByText, getByPlaceholderText } = render(<NavBar />);
    expect(getByText('SnapSum')).toBeInTheDocument();
    expect(getByPlaceholderText('Enter YouTube video link')).toBeInTheDocument();
  });

  test('handles search with video link', async () => {
    const { getByPlaceholderText } = render(<NavBar />);
    const inputElement = getByPlaceholderText('Enter YouTube video link');
    fireEvent.change(inputElement, { target: { value: 'https://www.youtube.com/watch?v=abcd1234' } });
    fireEvent.keyDown(inputElement, { key: 'Enter', code: 'Enter' });
    await waitFor(() => expect(get_playlist).toHaveBeenCalledWith('https://www.youtube.com/watch?v=abcd1234', expect.any(Function)));
    await waitFor(() => expect(get_video_list).not.toHaveBeenCalled());
  });

  test('handles search with playlist link', async () => {
    const { getByPlaceholderText } = render(<NavBar />);
    const inputElement = getByPlaceholderText('Enter YouTube video link');
    fireEvent.change(inputElement, { target: { value: 'https://www.youtube.com/playlist?list=efgh5678' } });
    fireEvent.keyDown(inputElement, { key: 'Enter', code: 'Enter' });
    await waitFor(() => expect(get_playlist).toHaveBeenCalledWith('https://www.youtube.com/playlist?list=efgh5678', expect.any(Function)));
    await waitFor(() => expect(get_video_list).toHaveBeenCalledWith('https://www.youtube.com/playlist?list=efgh5678'));
  });
});
