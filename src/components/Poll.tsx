// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { pollApi } from '../utils/pollApi';
// import { socketService } from '../utils/socket';
// import type { Poll as PollType } from '../utils/pollApi';

// const Poll: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const [poll, setPoll] = useState<PollType | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [hasVoted, setHasVoted] = useState(false);

//   useEffect(() => {
//     const initializePoll = async () => {
//       try {
//         if (!id) {
//           setError('Poll ID is required');
//           setLoading(false);
//           return;
//         }

//         const pollId = parseInt(id);
//         socketService.connect();
//         socketService.joinPoll(pollId);

//         const pollData = await pollApi.getPoll(pollId);

//         const userId = pollApi.getCurrentUserId();
//         const alreadyVoted = pollData.votes.some(vote => vote.userId === userId);
//         setHasVoted(alreadyVoted);
//         setPoll(pollData);
//       } catch (err: any) {
//         setError(err.response?.data?.message || 'Failed to load poll');
//       } finally {
//         setLoading(false);
//       }
//     };

//     initializePoll();

//     socketService.onVoteUpdate((data) => {
//       setPoll(prev => {
//         if (!prev) return prev;
//         return {
//           ...prev,
//           votes: data.votes.map(vote => ({
//             optionIndex: vote.option_index,
//             count: vote.count
//           }))
//         };
//       });
//     });

//     return () => {
//       socketService.disconnect();
//     };
//   }, [id]);

//   const handleVote = async (optionIndex: number) => {
//     if (!id) return;
//     try {
//       await pollApi.vote(parseInt(id), { optionIndex });
//       setHasVoted(true);
//     } catch (err: any) {
//       setError(err.response?.data?.message || 'Failed to vote');
//     }
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div className="error">{error}</div>;
//   if (!poll) return <div>Poll not found</div>;

//   const totalVotes = poll.votes.reduce((sum, vote) => sum + parseInt(vote.count), 0);

//   return (
//     <div className="poll">
//       <button onClick={() => navigate(-1)} className="back-button">← Back</button>

//       <h2>{poll.question}</h2>
//       {poll.isExpired && <div className="expired">This poll has expired</div>}
//       {hasVoted && !poll.isExpired && (
//         <div className="info-message">✅ You have already voted in this poll.</div>
//       )}

//       <div className="options">
//         {poll.options.map((option, index) => {
//           const voteCount = poll.votes.find(v => v.optionIndex === index)?.count || '0';
//           const percentage = totalVotes > 0 ? (parseInt(voteCount) / totalVotes) * 100 : 0;

//           return (
//             <div key={index} className="option">
//               <button
//                 onClick={() => handleVote(index)}
//                 disabled={poll.isExpired || hasVoted}
//               >
//                 {option}
//               </button>
//               <div className="vote-bar">
//                 <div
//                   className="vote-fill"
//                   style={{ width: `${percentage}%` }}
//                 />
//               </div>
//               <span className="vote-count">
//                 {voteCount} votes ({percentage.toFixed(1)}%)
//               </span>
//             </div>
//           );
//         })}
//       </div>

//       <div className="total-votes">Total votes: {totalVotes}</div>
//     </div>
//   );
// };

// export default Poll;




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

  useEffect(() => {
    const initializePoll = async () => {
      try {
        if (!id) {
          setError('Poll ID is required');
          setLoading(false);
          return;
        }

        const pollId = parseInt(id);

        // Load all polls (to get navigation context)
        const allPolls = await pollApi.getPolls();
        setPollList(allPolls);

        socketService.connect();
        socketService.joinPoll(pollId);

        const pollData = await pollApi.getPoll(pollId);
        const userId = pollApi.getCurrentUserId();
        const alreadyVoted = pollData.votes.some(vote => vote.userId === userId);

        setPoll(pollData);
        setHasVoted(alreadyVoted);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load poll');
      } finally {
        setLoading(false);
      }
    };

    initializePoll();

    socketService.onVoteUpdate((data) => {
      setPoll(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          votes: data.votes.map(vote => ({
            optionIndex: vote.option_index,
            count: vote.count
          }))
        };
      });
    });

    return () => {
      socketService.disconnect();
    };
  }, [id]);

  const handleVote = async (optionIndex: number) => {
    if (!id) return;
    try {
      await pollApi.vote(parseInt(id), { optionIndex });
      setHasVoted(true);
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

          return (
            <div key={index} className="option">
              <button
                onClick={() => handleVote(index)}
                disabled={poll.isExpired || hasVoted}
              >
                {option}
              </button>
              <div className="vote-bar">
                <div
                  className="vote-fill"
                  style={{ width: `${percentage}%` }}
                />
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