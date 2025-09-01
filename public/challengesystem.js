// Challenge System Component for NHH Squash Ladder
window.ChallengeSystem = ({ 
    user, 
    players = [], 
    challenges = [],
    onChallengeCreated, 
    onChallengeUpdated, 
    onNotification 
}) => {
    const { useState } = React;
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedChallenger, setSelectedChallenger] = useState('');
    const [selectedOpponent, setSelectedOpponent] = useState('');
    const [createError, setCreateError] = useState('');

    // Helper functions
    const getPlayerById = (id) => players.find(p => p.id === id);
    const getPlayerName = (id) => getPlayerById(id)?.name || 'Unknown Player';
    
    const getDaysRemaining = (deadline) => {
        const now = new Date();
        const deadlineDate = deadline instanceof Date ? deadline : deadline.toDate();
        const diffTime = deadlineDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getCurrentUserPlayer = () => {
        return players.find(p => p.userId === user?.uid);
    };

    const getEligibleOpponents = (challengerId) => {
        const challenger = getPlayerById(challengerId);
        if (!challenger) return [];
        
        return players.filter(player => 
            player.position < challenger.position && // Only players above in ladder
            player.id !== challengerId // Not themselves
        ).sort((a, b) => a.position - b.position);
    };

    const canUserChallenge = (userId) => {
        const userPlayer = players.find(p => p.userId === userId);
        if (!userPlayer) return false;

        // Check if user has pending/accepted challenges as challenger
        const existingChallenge = challenges.find(c => 
            c.challengerId === userPlayer.id && 
            ['pending', 'accepted'].includes(c.status)
        );
        
        return !existingChallenge;
    };

    // Challenge creation
    const createChallenge = async () => {
        try {
            setCreateError('');

            if (!selectedChallenger || !selectedOpponent) {
                setCreateError('Please select both challenger and opponent.');
                return;
            }

            const challenger = getPlayerById(selectedChallenger);
            const opponent = getPlayerById(selectedOpponent);

            if (challenger.position <= opponent.position) {
                setCreateError('You can only challenge players above you in the ladder.');
                return;
            }

            // Create deadline (3 weeks from now)
            const deadline = new Date();
            deadline.setDate(deadline.getDate() + 21);

            const challengeData = {
                challengerId: selectedChallenger,
                challengedId: selectedOpponent,
                status: 'pending',
                dateCreated: firebase.firestore.Timestamp.now(),
                deadline: firebase.firestore.Timestamp.fromDate(deadline),
                createdBy: user.uid
            };

            const docRef = await db.collection('challenges').add(challengeData);
            
            if (onChallengeCreated) {
                onChallengeCreated(docRef.id, challengeData);
            }

            if (onNotification) {
                onNotification(
                    `${challenger.name} challenged ${opponent.name}!`, 
                    'success'
                );
            }

            setShowCreateForm(false);
            setSelectedChallenger('');
            setSelectedOpponent('');

        } catch (error) {
            console.error('Error creating challenge:', error);
            setCreateError('Failed to create challenge. Please try again.');
        }
    };

    // Accept challenge
    const acceptChallenge = async (challengeId) => {
        try {
            await db.collection('challenges').doc(challengeId).update({
                status: 'accepted',
                acceptedDate: firebase.firestore.Timestamp.now()
            });

            const challenge = challenges.find(c => c.id === challengeId);
            const challenger = getPlayerById(challenge.challengerId);
            const challenged = getPlayerById(challenge.challengedId);

            if (onNotification) {
                onNotification(
                    `${challenged.name} accepted ${challenger.name}'s challenge!`, 
                    'success'
                );
            }

        } catch (error) {
            console.error('Error accepting challenge:', error);
        }
    };

    // Decline challenge
    const declineChallenge = async (challengeId) => {
        try {
            await db.collection('challenges').doc(challengeId).update({
                status: 'declined',
                declinedDate: firebase.firestore.Timestamp.now()
            });

            const challenge = challenges.find(c => c.id === challengeId);
            const challenger = getPlayerById(challenge.challengerId);
            const challenged = getPlayerById(challenge.challengedId);

            if (onNotification) {
                onNotification(
                    `${challenged.name} declined ${challenger.name}'s challenge.`, 
                    'info'
                );
            }

        } catch (error) {
            console.error('Error declining challenge:', error);
        }
    };

    const currentUserPlayer = getCurrentUserPlayer();

    return React.createElement('div', {
        className: 'space-y-6'
    }, [
        // Header
        React.createElement('div', {
            key: 'header',
            className: 'flex justify-between items-center'
        }, [
            React.createElement('div', {
                key: 'title-section'
            }, [
                React.createElement('h2', {
                    key: 'title',
                    className: 'text-2xl font-bold text-gray-900'
                }, 'Challenge System'),
                React.createElement('p', {
                    key: 'subtitle',
                    className: 'text-gray-600 mt-1'
                }, 'Challenge players above you in the ladder')
            ]),

            currentUserPlayer && canUserChallenge(user.uid) && React.createElement('button', {
                key: 'create-btn',
                onClick: () => setShowCreateForm(true),
                className: 'bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700'
            }, 'Create Challenge')
        ]),

        // User Status
        currentUserPlayer && React.createElement('div', {
            key: 'user-status',
            className: 'bg-blue-50 border border-blue-200 rounded-lg p-4'
        }, [
            React.createElement('h3', {
                key: 'status-title',
                className: 'font-medium text-blue-900'
            }, 'Your Challenge Status'),
            React.createElement('p', {
                key: 'status-desc',
                className: 'text-blue-700 text-sm mt-1'
            }, `Position #${currentUserPlayer.position} - ${currentUserPlayer.name} ${currentUserPlayer.avatarEmoji || ''}`)
        ]),

        // Challenges List
        React.createElement('div', {
            key: 'challenges-list',
            className: 'space-y-4'
        }, challenges.length === 0 ? 
            React.createElement('div', {
                key: 'empty-state',
                className: 'text-center py-8 bg-gray-50 rounded-lg'
            }, [
                React.createElement('h3', {
                    key: 'empty-title',
                    className: 'text-lg font-medium text-gray-900 mb-2'
                }, 'No Active Challenges'),
                React.createElement('p', {
                    key: 'empty-desc',
                    className: 'text-gray-600'
                }, currentUserPlayer ? 
                    'Create the first challenge to start competing!' : 
                    'Join the ladder to participate in challenges'
                )
            ]) :
            challenges.map(challenge => {
                const challenger = getPlayerById(challenge.challengerId);
                const challenged = getPlayerById(challenge.challengedId);
                const daysRemaining = getDaysRemaining(challenge.deadline);
                const isOverdue = daysRemaining < 0;
                const isUserInvolved = currentUserPlayer && (
                    challenge.challengerId === currentUserPlayer.id ||
                    challenge.challengedId === currentUserPlayer.id
                );
                const isUserChallenged = currentUserPlayer && 
                    challenge.challengedId === currentUserPlayer.id;

                return React.createElement('div', {
                    key: challenge.id,
                    className: `bg-white border rounded-lg p-4 ${isUserInvolved ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`
                }, [
                    React.createElement('div', {
                        key: 'challenge-content',
                        className: 'flex justify-between items-start'
                    }, [
                        React.createElement('div', {
                            key: 'challenge-info',
                            className: 'flex-1'
                        }, [
                            React.createElement('div', {
                                key: 'players',
                                className: 'font-medium mb-2'
                            }, `${challenger?.name} (#${challenger?.position}) challenges ${challenged?.name} (#${challenged?.position})`),
                            React.createElement('div', {
                                key: 'timing',
                                className: 'text-sm text-gray-600'
                            }, `Created: ${challenge.dateCreated.toLocaleDateString()} | ${
                                isOverdue ? 
                                    `Overdue by ${Math.abs(daysRemaining)} days` : 
                                    `${daysRemaining} days remaining`
                            }`)
                        ]),

                        React.createElement('div', {
                            key: 'actions',
                            className: 'flex items-center gap-2'
                        }, [
                            React.createElement('span', {
                                key: 'status',
                                className: `px-3 py-1 rounded-full text-sm font-medium ${
                                    challenge.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    challenge.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                                }`
                            }, challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)),

                            challenge.status === 'pending' && isUserChallenged && React.createElement('div', {
                                key: 'pending-actions',
                                className: 'flex gap-2'
                            }, [
                                React.createElement('button', {
                                    key: 'accept',
                                    onClick: () => acceptChallenge(challenge.id),
                                    className: 'bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700'
                                }, 'Accept'),
                                React.createElement('button', {
                                    key: 'decline',
                                    onClick: () => declineChallenge(challenge.id),
                                    className: 'bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700'
                                }, 'Decline')
                            ]),

                            challenge.status === 'accepted' && React.createElement('button', {
                                key: 'record-match',
                                onClick: () => {
                                    if (onNotification) {
                                        onNotification('Match recording will be available soon!', 'info');
                                    }
                                },
                                className: 'bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700'
                            }, 'Record Match')
                        ])
                    ])
                ]);
            })
        ),

        // Create Challenge Modal
        showCreateForm && React.createElement('div', {
            key: 'create-modal',
            className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
        }, React.createElement('div', {
            className: 'bg-white rounded-lg p-6 w-full max-w-md'
        }, [
            React.createElement('h3', {
                key: 'modal-title',
                className: 'text-lg font-bold mb-4'
            }, 'Create Challenge'),
            
            createError && React.createElement('div', {
                key: 'error',
                className: 'mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm'
            }, createError),

            React.createElement('div', {
                key: 'form-fields',
                className: 'space-y-4'
            }, [
                React.createElement('div', {
                    key: 'challenger-field'
                }, [
                    React.createElement('label', {
                        key: 'challenger-label',
                        className: 'block text-sm font-medium text-gray-700 mb-2'
                    }, 'Challenger'),
                    React.createElement('select', {
                        key: 'challenger-select',
                        value: selectedChallenger,
                        onChange: (e) => {
                            setSelectedChallenger(e.target.value);
                            setSelectedOpponent('');
                        },
                        className: 'w-full p-3 border border-gray-300 rounded-lg'
                    }, [
                        React.createElement('option', {
                            key: 'challenger-placeholder',
                            value: ''
                        }, 'Select challenger...'),
                        ...players
                            .filter(player => canUserChallenge(player.userId))
                            .map(player => 
                                React.createElement('option', {
                                    key: player.id,
                                    value: player.id
                                }, `#${player.position} ${player.name}`)
                            )
                    ])
                ]),

                React.createElement('div', {
                    key: 'opponent-field'
                }, [
                    React.createElement('label', {
                        key: 'opponent-label',
                        className: 'block text-sm font-medium text-gray-700 mb-2'
                    }, 'Player to Challenge'),
                    React.createElement('select', {
                        key: 'opponent-select',
                        value: selectedOpponent,
                        onChange: (e) => setSelectedOpponent(e.target.value),
                        className: 'w-full p-3 border border-gray-300 rounded-lg',
                        disabled: !selectedChallenger
                    }, [
                        React.createElement('option', {
                            key: 'opponent-placeholder',
                            value: ''
                        }, selectedChallenger ? 'Select opponent...' : 'Select challenger first'),
                        ...getEligibleOpponents(selectedChallenger).map(player => 
                            React.createElement('option', {
                                key: player.id,
                                value: player.id
                            }, `#${player.position} ${player.name}`)
                        )
                    ])
                ]),

                React.createElement('div', {
                    key: 'rules-info',
                    className: 'bg-blue-50 p-3 rounded-lg text-sm text-blue-800'
                }, [
                    React.createElement('p', {
                        key: 'rules-title',
                        className: 'font-medium'
                    }, 'Challenge Rules:'),
                    React.createElement('ul', {
                        key: 'rules-list',
                        className: 'mt-1 space-y-1'
                    }, [
                        React.createElement('li', { key: 'rule1' }, '• You can only challenge players above you'),
                        React.createElement('li', { key: 'rule2' }, '• Matches must be played within 3 weeks'),
                        React.createElement('li', { key: 'rule3' }, '• Only one active challenge per player')
                    ])
                ])
            ]),

            React.createElement('div', {
                key: 'modal-buttons',
                className: 'flex gap-3 mt-6'
            }, [
                React.createElement('button', {
                    key: 'create-btn',
                    onClick: createChallenge,
                    disabled: !selectedChallenger || !selectedOpponent,
                    className: 'flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed'
                }, 'Create Challenge'),
                React.createElement('button', {
                    key: 'cancel-btn',
                    onClick: () => {
                        setShowCreateForm(false);
                        setSelectedChallenger('');
                        setSelectedOpponent('');
                        setCreateError('');
                    },
                    className: 'flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400'
                }, 'Cancel')
            ])
        ]))
    ]);
};