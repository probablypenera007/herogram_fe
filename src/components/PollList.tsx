import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { pollApi } from '../utils/pollApi';
import type { Poll } from '../utils/pollApi';

interface PollListProps {
  userRole?: 'user' | 'admin';
}

const PollList: React.FC<PollListProps> = ({ userRole }) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votedPolls, setVotedPolls] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const data = await pollApi.getPolls();
        setPolls(data);
        
        // Get user's votes for each poll
        const votedPollsSet = new Set<number>();
        for (const poll of data) {
          const userVote = poll.votes.find(vote => vote.userId === pollApi.getCurrentUserId());
          if (userVote) {
            votedPollsSet.add(poll.id);
          }
        }
        setVotedPolls(votedPollsSet);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load polls');
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []);

  const handleDashboardClick = () => {
    navigate('/');
  };

  if (loading) {
    return <div>Loading polls...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (polls.length === 0) {
    return (
      <div className="completion-message">
        <h2>🎉 Congratulations! 🎉</h2>
        <p>You've completed all available polls!</p>
        {userRole === 'admin' && (
          <button onClick={handleDashboardClick} className="dashboard-button">
            View Dashboard
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="poll-list">
      <div className="poll-list-header">
        <h2>Active Polls</h2>
        {userRole === 'admin' && (
          <button onClick={handleDashboardClick} className="dashboard-button">
            View Dashboard
          </button>
        )}
      </div>
      <div className="polls-grid">
        {polls.map(poll => {
          const hasVoted = votedPolls.has(poll.id);
          
          return (
            <Link 
              to={hasVoted ? '#' : `/poll/${poll.id}`} 
              key={poll.id} 
              className={`poll-card ${hasVoted ? 'voted' : ''}`}
              onClick={(e) => hasVoted && e.preventDefault()}
            >
              <h3>{poll.question}</h3>
              <div className="poll-info">
                <span className="total-votes">
                  {poll.totalVotes || 0} votes
                </span>
                {poll.isExpired && (
                  <span className="expired-badge">Expired</span>
                )}
                {hasVoted && (
                  <span className="voted-badge">Voted</span>
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
          );
        })}
      </div>
    </div>
  );
};

export default PollList; 