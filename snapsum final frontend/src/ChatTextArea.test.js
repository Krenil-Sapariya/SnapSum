import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatTextArea from './ChatTextArea';

describe('ChatTextArea component', () => {
  it('renders without crashing', () => {
    render(<ChatTextArea />);
  });

  it('renders loading state correctly', () => {
    const { getByText } = render(<ChatTextArea loading={true} />);
    expect(getByText("Please wait while we're getting things ready...")).toBeInTheDocument();
  });

  it('allows user to type a message and send it', async () => {
    render(<ChatTextArea />);
    const inputField = screen.getByPlaceholderText('Ask any Question');
    fireEvent.change(inputField, { target: { value: 'Test message' } });
    expect(inputField).toHaveValue('Test message');

    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(inputField).toHaveValue('');
    });
  });

  it('disables send button when loader is active', () => {
    render(<ChatTextArea loading={true} />);
    const sendButton = screen.getByText('Send');
    expect(sendButton).toBeDisabled();
  });

  it('calls handleSummary function when summary button is clicked', async () => {
    const handleSummary = jest.fn();
    render(<ChatTextArea handleSummary={handleSummary} />);
    const summaryButton = screen.getByRole('button', { name: '' }); // Add button text
    fireEvent.click(summaryButton);
    await waitFor(() => {
      expect(handleSummary).toHaveBeenCalledTimes(1);
    });
  });

  // Add more test cases as needed
});
