import { useState } from 'react';
import { pollApi } from '../utils/pollApi';

export default function CreatePoll() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [expiresAt, setExpiresAt] = useState('');
  const [pollId, setPollId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id } = await pollApi.createPoll({
        question,
        options,
        expiresAt: new Date(expiresAt).toISOString()
      });
      setPollId(id);
    } catch (error) {
      console.error('Error creating poll:', error);
      setError('Failed to create poll');
    }
  };

  if (error) return <div className="error">{error}</div>;

  if (pollId) {
    return (
      <div>
        <h2>Poll Created!</h2>
        <p>Share this link with your team:</p>
        <code>{window.location.origin}/poll/{pollId}</code>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="create-poll-form">
      <div>
        <label htmlFor="question">Question:</label>
        <input
          type="text"
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Options:</label>
        {options.map((option, index) => (
          <input
            key={index}
            type="text"
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            required
          />
        ))}
        <button type="button" onClick={handleAddOption}>
          Add Option
        </button>
      </div>

      <div>
        <label htmlFor="expiresAt">Expires At:</label>
        <input
          type="datetime-local"
          id="expiresAt"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          required
        />
      </div>

      <button type="submit">Create Poll</button>
    </form>
  );
} 