import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pollApi } from '../utils/pollApi';
import type { Poll } from '../utils/pollApi';

const PollList: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const data = await pollApi.getPolls();
        setPolls(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load polls');
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []);

  if (loading) {
    return <div>Loading polls...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (polls.length === 0) {
    return <div>No polls available</div>;
  }

  return (
    <div className="poll-list">
      <h2>Active Polls</h2>
      <div className="polls-grid">
        {polls.map(poll => (
          <Link to={`/poll/${poll.id}`} key={poll.id} className="poll-card">
            <h3>{poll.question}</h3>
            <div className="poll-info">
              <span className="total-votes">
                {poll.totalVotes || 0} votes
              </span>
              {poll.isExpired && (
                <span className="expired-badge">Expired</span>
              )}
            </div>
            <div className="options-preview">
              {poll.options.slice(0, 2).map((option, index) => (
                <div key={index} className="option-preview">
                  {option}
                </div>
              ))}
              {poll.options.length > 2 && (
                <div className="more-options">
                  +{poll.options.length - 2} more options
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PollList; 