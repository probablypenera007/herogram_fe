import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pollApi } from '../utils/pollApi';
import { socketService } from '../utils/socket';
import type { Poll as PollType } from '../utils/pollApi';

const Poll: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [poll, setPoll] = useState<PollType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [pollList, setPollList] = useState<PollType[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    const pollId = parseInt(id || '0');
    const userId = pollApi.getCurrentUserId();

    socketService.joinPoll(pollId);
  
    // ✅ Register listeners EARLY
    socketService.onVoteUpdate((data) => {
      console.log("🔥 Real-time vote update received:", data);
      const currentUserId = pollApi.getCurrentUserId();
  
      setPoll(prev => {
  if (!prev) return prev;

  // Clone existing vote counts
  const voteCounts: Record<number, number> = {};

  // Reset counts
  prev.options.forEach((_, i) => {
    voteCounts[i] = 0;
  });

  // Aggregate new vote counts from all users
  data.votes.forEach(v => {
    voteCounts[v.optionIndex] = (voteCounts[v.optionIndex] || 0) + 1;
  });

  const updatedVotes = Object.entries(voteCounts).map(([index, count]) => ({
    optionIndex: parseInt(index),
    count: count.toString(),
    userId: -1 // optional placeholder if not relevant
  }));

  return {
    ...prev,
    votes: updatedVotes
  };
});
  
      if (currentUserId && data.userId === currentUserId) {
        setHasVoted(true);
        const myVote = data.votes.find(v => v.userId === currentUserId);
        if (myVote) setSelectedOption(myVote.optionIndex);
      }
    });
  
    socketService.onPollFetched((data) => {
      console.log("📡 pollFetched received in frontend:", data);
    });
  
    // 👇 Then load data
    const initializePoll = async () => {
      try {
        if (!id) {
          setError('Poll ID is required');
          setLoading(false);
          return;
        }
  
        const allPolls = await pollApi.getPolls();
        setPollList(allPolls);
  
        const pollData = await pollApi.getPoll(pollId);
        const alreadyVoted = userId !== null && pollData.votes.some(v => v.userId === userId);
        const userVote = pollData.votes.find(v => v.userId === userId);
  
        setPoll(pollData);
        setHasVoted(alreadyVoted);
        if (userVote) setSelectedOption(userVote.optionIndex);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load poll');
      } finally {
        setLoading(false);
      }
    };
  
    initializePoll();
  

  }, [id]);


  const handleVote = async (optionIndex: number) => {
    if (!id || hasVoted) return;
    try {
      await pollApi.vote(parseInt(id), { optionIndex });
      setHasVoted(true);
      setSelectedOption(optionIndex);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to vote');
    }
  };

  const goToNextPoll = () => {
    const currentIndex = pollList.findIndex(p => p.id === parseInt(id || '0'));
    if (currentIndex !== -1 && currentIndex + 1 < pollList.length) {
      const nextPoll = pollList[currentIndex + 1];
      navigate(`/poll/${nextPoll.id}`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!poll) return <div>Poll not found</div>;

  const totalVotes = poll.votes.reduce((sum, vote) => sum + parseInt(vote.count), 0);
  const isLastPoll = pollList.findIndex(p => p.id === parseInt(id || '0')) === pollList.length - 1;

  return (
    <div className="poll">
      <button onClick={() => navigate(-1)} className="back-button">← Back</button>

      <h2>{poll.question}</h2>

      {poll.isExpired && <div className="expired">This poll has expired</div>}

      {hasVoted && !poll.isExpired && (
        <div className="info-message">✅ You have already voted in this poll.</div>
      )}

      <div className="options">
        {poll.options.map((option, index) => {
          const voteCount = poll.votes.find(v => v.optionIndex === index)?.count || '0';
          const percentage = totalVotes > 0 ? (parseInt(voteCount) / totalVotes) * 100 : 0;
          const isSelected = selectedOption === index;

          return (
            <div key={index} className={`option ${isSelected ? 'selected' : ''}`}>
              <button
                onClick={() => handleVote(index)}
                className={isSelected ? 'selected' : ''}
                disabled={poll.isExpired || hasVoted}
              >
                {option}
                {isSelected && <span className="checkmark">✓</span>}
              </button>
              <div className="vote-bar">
                <div className="vote-fill" style={{ width: `${percentage}%` }} />
              </div>
              <span className="vote-count">
                {voteCount} votes ({percentage.toFixed(1)}%)
              </span>
            </div>
          );
        })}
      </div>

      <div className="total-votes">Total votes: {totalVotes}</div>

      {!isLastPoll && (
        <button onClick={goToNextPoll} className="dashboard-button" style={{ marginTop: '1rem' }}>
          → Next Question
        </button>
      )}
    </div>
  );
};

export default Poll;