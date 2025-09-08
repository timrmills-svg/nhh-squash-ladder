const { useState, useEffect } = React;

const NHHSquashLadder = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [players, setPlayers] = useState([]);
    
    // Auth states
    const [showAuth, setShowAuth] = useState(false);
    const [authMode, setAuthMode] = useState('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [authError, setAuthError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    
    // Form states
    const [showJoinForm, setShowJoinForm] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState('');
    const [joinError, setJoinError] = useState('');

    // Available avatars
    const avatars = [
        { id: 'racket1', emoji: '🏓', name: 'Ping Pong' },
        { id: 'racket2', emoji: '🎾', name: 'Tennis' },
        { id: 'racket3', emoji: '🏸', name: 'Badminton' },
        { id: 'trophy1', emoji: '🏆', name: 'Gold Trophy' },
        { id: 'trophy2', emoji: '🥇', name: 'Gold Medal' },
        { id: 'trophy3', emoji: '🥈', name: 'Silver Medal' },
        { id: 'sport1', emoji: '⚡', name: 'Lightning' },
        { id: 'sport2', emoji: '🔥', name: 'Fire' },
        { id: 'sport3', emoji: '💪', name: 'Strong' },
        { id: 'sport4', emoji: '🎯', name: 'Target' },
        { id: 'sport5', emoji: '⭐', name: 'Star' },
        { id: 'sport6', emoji: '🚀', name: 'Rocket' }
    ];

    // Initialize Firebase listeners
    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
        });
        return unsubscribeAuth;
    }, []);

    // Listen to players data
    useEffect(() => {
        if (!user) {
            setPlayers([]);
            return;
        }
        
        const unsubscribePlayers = db.collection('players')
            .orderBy('position', 'asc')
            .onSnapshot((snapshot) => {
                const playersList = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    const playerData = { 
                        id: doc.id, 
                        ...data,
                        avatarEmoji: data.avatarEmoji || '❓'
                    };
                    playersList.push(playerData);
                });
                
                // Remove duplicates
                const uniquePlayers = [];
                const seenUsers = new Set();
                playersList.forEach(player => {
                    if (!seenUsers.has(player.userId)) {
                        seenUsers.add(player.userId);
                        uniquePlayers.push(player);
                    }
                });
                
                setPlayers(uniquePlayers);
            }, (error) => {
                console.error('Error listening to players:', error);
                setPlayers([]);
            });
            
        return () => unsubscribePlayers();
    }, [user]);

    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const clearAuthForm = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
        setAuthError('');
    };

    // Authentication functions
    const signInWithGoogle = async () => {
        try {
            setAuthLoading(true);
            setAuthError('');
            const provider = new firebase.auth.GoogleAuthProvider();
            await auth.signInWithPopup(provider);
            setShowAuth(false);
            clearAuthForm();
        } catch (error) {
            console.error('Google sign-in error:', error);
            let errorMessage = 'Google sign-in failed. ';
            
            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    errorMessage += 'Sign-in was cancelled.';
                    break;
                case 'auth/popup-blocked':
                    errorMessage += 'Pop-up was blocked by your browser.';
                    break;
                case 'auth/cancelled-popup-request':
                    errorMessage += 'Sign-in was cancelled.';
                    break;
                default:
                    errorMessage += 'Please try again.';
            }
            
            setAuthError(errorMessage);
        } finally {
            setAuthLoading(false);
        }
    };

    const signInWithEmail = async () => {
        try {
            setAuthLoading(true);
            setAuthError('');

            // Validation
            if (!email.trim()) {
                setAuthError('Email is required.');
                return;
            }

            if (!validateEmail(email)) {
                setAuthError('Please enter a valid email address.');
                return;
            }

            if (!password) {
                setAuthError('Password is required.');
                return;
            }

            await auth.signInWithEmailAndPassword(email, password);
            setShowAuth(false);
            clearAuthForm();

        } catch (error) {
            console.error('Email sign-in error:', error);
            let errorMessage = '';

            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email address.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password. Please try again.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address format.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your connection.';
                    break;
                default:
                    errorMessage = 'Sign-in failed. Please check your credentials and try again.';
            }

            setAuthError(errorMessage);
        } finally {
            setAuthLoading(false);
        }
    };

    const signUpWithEmail = async () => {
        try {
            setAuthLoading(true);
            setAuthError('');

            // Validation
            if (!name.trim()) {
                setAuthError('Full name is required.');
                return;
            }

            if (name.trim().length < 2) {
                setAuthError('Name must be at least 2 characters.');
                return;
            }

            if (!email.trim()) {
                setAuthError('Email is required.');
                return;
            }

            if (!validateEmail(email)) {
                setAuthError('Please enter a valid email address.');
                return;
            }

            if (!password) {
                setAuthError('Password is required.');
                return;
            }

            if (!validatePassword(password)) {
                setAuthError('Password must be at least 6 characters.');
                return;
            }

            if (password !== confirmPassword) {
                setAuthError('Passwords do not match.');
                return;
            }

            const result = await auth.createUserWithEmailAndPassword(email, password);
            await result.user.updateProfile({ displayName: name.trim() });
            
            setShowAuth(false);
            clearAuthForm();

        } catch (error) {
            console.error('Email sign-up error:', error);
            let errorMessage = '';

            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'An account with this email already exists. Try signing in instead.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address format.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak. Please choose a stronger password.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your connection.';
                    break;
                default:
                    errorMessage = 'Account creation failed. Please try again.';
            }

            setAuthError(errorMessage);
        } finally {
            setAuthLoading(false);
        }
    };

    const resetPassword = async () => {
        if (!email.trim()) {
            setAuthError('Please enter your email address first.');
            return;
        }

        if (!validateEmail(email)) {
            setAuthError('Please enter a valid email address.');
            return;
        }

        try {
            setAuthLoading(true);
            setAuthError('');
            await auth.sendPasswordResetEmail(email);
            setAuthError(''); // Clear any errors
            alert(`Password reset email sent to ${email}. Please check your inbox.`);
        } catch (error) {
            let errorMessage = '';
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email address.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address format.';
                    break;
                default:
                    errorMessage = 'Failed to send reset email. Please try again.';
            }
            setAuthError(errorMessage);
        } finally {
            setAuthLoading(false);
        }
    };

    // Player management functions
    const getCurrentUserPlayer = () => {
        return players.find(p => p.userId === user?.uid);
    };

    const isDisplayNameTaken = (name) => {
        return players.some(p => p.name.toLowerCase() === name.toLowerCase());
    };

    const isAvatarTaken = (avatarId) => {
        return players.some(p => p.avatar === avatarId);
    };

    const getAvailableAvatars = () => {
        return avatars.filter(avatar => !isAvatarTaken(avatar.id));
    };

    const joinLadder = async (playerName) => {
        try {
            setJoinError('');
            
            if (!playerName.trim()) {
                setJoinError('Display name is required');
                return;
            }

            if (playerName.trim().length < 2) {
                setJoinError('Display name must be at least 2 characters');
                return;
            }

            if (playerName.trim().length > 20) {
                setJoinError('Display name must be 20 characters or less');
                return;
            }

            if (getCurrentUserPlayer()) {
                setJoinError('You are already in the ladder');
                return;
            }

            if (isDisplayNameTaken(playerName.trim())) {
                setJoinError('This display name is already taken. Please choose another.');
                return;
            }

            if (!selectedAvatar) {
                setJoinError('Please select an avatar');
                return;
            }

            if (isAvatarTaken(selectedAvatar)) {
                setJoinError('This avatar is already taken. Please choose another.');
                return;
            }

            const newPosition = players.length + 1;
            const selectedAvatarData = avatars.find(a => a.id === selectedAvatar);
            
            const playerData = {
                name: playerName.trim(),
                email: user.email,
                userId: user.uid,
                position: newPosition,
                participationPoints: 0,
                totalMatches: 0,
                wins: 0,
                losses: 0,
                avatar: selectedAvatar,
                avatarEmoji: selectedAvatarData.emoji,
                joinDate: firebase.firestore.Timestamp.now()
            };
            
            await db.collection('players').add(playerData);
            setShowJoinForm(false);
            setSelectedAvatar('');
            
        } catch (error) {
            console.error('Error joining ladder:', error);
            setJoinError('Error joining ladder. Please try again.');
        }
    };

    // Loading screen
    if (loading) {
        return React.createElement('div', {
            style: { 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f3f4f6'
            }
        }, 'Loading NHH Squash Ladder...');
    }

    // Authentication screen
    if (!user) {
        return React.createElement('div', {
            style: {
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f3f4f6',
                padding: '20px'
            }
        }, React.createElement('div', {
            style: {
                backgroundColor: 'white',
                padding: '32px',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                width: '100%',
                maxWidth: '400px'
            }
        }, [
            // Header
            React.createElement('div', {
                key: 'header',
                style: { textAlign: 'center', marginBottom: '32px' }
            }, [
                React.createElement('h1', {
                    key: 'title',
                    style: { fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }
                }, 'NHH Squash Ladder'),
                React.createElement('p', {
                    key: 'subtitle',
                    style: { color: '#6b7280', fontSize: '16px' }
                }, 'Join the competition')
            ]),
            
            // Error message
            authError && React.createElement('div', {
                key: 'error',
                style: {
                    marginBottom: '20px',
                    padding: '12px 16px',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    borderRadius: '8px',
                    fontSize: '14px'
                }
            }, authError),
            
            // Main auth options or detailed form
            !showAuth ? React.createElement('div', {
                key: 'auth-options',
                style: { display: 'flex', flexDirection: 'column', gap: '16px' }
            }, [
                // Google Sign-in button
                React.createElement('button', {
                    key: 'google-signin',
                    onClick: signInWithGoogle,
                    disabled: authLoading,
                    style: {
                        width: '100%',
                        backgroundColor: 'white',
                        border: '2px solid #e5e7eb',
                        color: '#374151',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        cursor: authLoading ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        transition: 'all 0.2s',
                        opacity: authLoading ? 0.6 : 1
                    }
                }, [
                    React.createElement('svg', {
                        key: 'google-icon',
                        width: '20',
                        height: '20',
                        viewBox: '0 0 24 24'
                    }, [
                        React.createElement('path', {
                            key: 'path1',
                            fill: '#4285f4',
                            d: 'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                        }),
                        React.createElement('path', {
                            key: 'path2',
                            fill: '#34a853',
                            d: 'M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                        }),
                        React.createElement('path', {
                            key: 'path3',
                            fill: '#fbbc05',
                            d: 'M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                        }),
                        React.createElement('path', {
                            key: 'path4',
                            fill: '#ea4335',
                            d: 'M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                        })
                    ]),
                    authLoading ? 'Signing in...' : 'Continue with Google'
                ]),
                
                // Divider
                React.createElement('div', {
                    key: 'divider',
                    style: { textAlign: 'center', position: 'relative', margin: '8px 0' }
                }, [
                    React.createElement('div', {
                        key: 'line',
                        style: { height: '1px', backgroundColor: '#e5e7eb' }
                    }),
                    React.createElement('span', {
                        key: 'text',
                        style: {
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: 'white',
                            padding: '0 16px',
                            fontSize: '14px',
                            color: '#6b7280'
                        }
                    }, 'or')
                ]),
                
                // Email option button
                React.createElement('button', {
                    key: 'email-option',
                    onClick: () => setShowAuth(true),
                    disabled: authLoading,
                    style: {
                        width: '100%',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        cursor: authLoading ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        fontWeight: '500',
                        opacity: authLoading ? 0.6 : 1,
                        transition: 'all 0.2s'
                    }
                }, 'Continue with Email')
            ]) : React.createElement('div', {
                key: 'detailed-auth',
                style: { display: 'flex', flexDirection: 'column', gap: '20px' }
            }, [
                // Mode toggle
                React.createElement('div', {
                    key: 'mode-toggle',
                    style: { display: 'flex', backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '4px' }
                }, [
                    React.createElement('button', {
                        key: 'signin-toggle',
                        onClick: () => {
                            setAuthMode('signin');
                            setAuthError('');
                        },
                        style: {
                            flex: 1,
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500',
                            backgroundColor: authMode === 'signin' ? 'white' : 'transparent',
                            color: authMode === 'signin' ? '#111827' : '#6b7280',
                            boxShadow: authMode === 'signin' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none'
                        }
                    }, 'Sign In'),
                    React.createElement('button', {
                        key: 'signup-toggle',
                        onClick: () => {
                            setAuthMode('signup');
                            setAuthError('');
                        },
                        style: {
                            flex: 1,
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500',
                            backgroundColor: authMode === 'signup' ? 'white' : 'transparent',
                            color: authMode === 'signup' ? '#111827' : '#6b7280',
                            boxShadow: authMode === 'signup' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none'
                        }
                    }, 'Sign Up')
                ]),
                
                // Form fields
                React.createElement('div', {
                    key: 'form-fields',
                    style: { display: 'flex', flexDirection: 'column', gap: '16px' }
                }, [
                    // Name field (signup only)
                    authMode === 'signup' && React.createElement('input', {
                        key: 'name-input',
                        type: 'text',
                        placeholder: 'Full name',
                        value: name,
                        onChange: (e) => setName(e.target.value),
                        style: {
                            width: '100%',
                            padding: '12px 16px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '16px',
                            transition: 'border-color 0.2s'
                        }
                    }),
                    
                    // Email field
                    React.createElement('input', {
                        key: 'email-input',
                        type: 'email',
                        placeholder: 'Email address',
                        value: email,
                        onChange: (e) => setEmail(e.target.value),
                        style: {
                            width: '100%',
                            padding: '12px 16px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '16px',
                            transition: 'border-color 0.2s'
                        }
                    }),
                    
                    // Password field
                    React.createElement('input', {
                        key: 'password-input',
                        type: 'password',
                        placeholder: authMode === 'signup' ? 'Password (min 6 characters)' : 'Password',
                        value: password,
                        onChange: (e) => setPassword(e.target.value),
                        style: {
                            width: '100%',
                            padding: '12px 16px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '16px',
                            transition: 'border-color 0.2s'
                        }
                    }),
                    
                    // Confirm password field (signup only)
                    authMode === 'signup' && React.createElement('input', {
                        key: 'confirm-password-input',
                        type: 'password',
                        placeholder: 'Confirm password',
                        value: confirmPassword,
                        onChange: (e) => setConfirmPassword(e.target.value),
                        style: {
                            width: '100%',
                            padding: '12px 16px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '16px',
                            transition: 'border-color 0.2s'
                        }
                    })
                ]),
                
                // Action buttons
                React.createElement('div', {
                    key: 'action-buttons',
                    style: { display: 'flex', flexDirection: 'column', gap: '12px' }
                }, [
                    // Primary action button
                    React.createElement('button', {
                        key: 'primary-action',
                        onClick: authMode === 'signin' ? signInWithEmail : signUpWithEmail,
                        disabled: authLoading,
                        style: {
                            width: '100%',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            cursor: authLoading ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: '600',
                            opacity: authLoading ? 0.6 : 1,
                            transition: 'all 0.2s'
                        }
                    }, authLoading ? 'Processing...' : (authMode === 'signin' ? 'Sign In' : 'Create Account')),
                    
                    // Forgot password (signin only)
                    authMode === 'signin' && React.createElement('button', {
                        key: 'forgot-password',
                        onClick: resetPassword,
                        disabled: authLoading,
                        style: {
                            width: '100%',
                            backgroundColor: 'transparent',
                            color: '#2563eb',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: authLoading ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            textDecoration: 'underline',
                            opacity: authLoading ? 0.6 : 1
                        }
                    }, 'Forgot password?'),
                    
                    // Back button
                    React.createElement('button', {
                        key: 'back-button',
                        onClick: () => {
                            setShowAuth(false);
                            clearAuthForm();
                        },
                        disabled: authLoading,
                        style: {
                            width: '100%',
                            backgroundColor: 'transparent',
                            color: '#6b7280',
                            border: '1px solid #d1d5db',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: authLoading ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            opacity: authLoading ? 0.6 : 1
                        }
                    }, 'Back to options')
                ])
            ])
        ]));
    }

    const currentUserPlayer = getCurrentUserPlayer();
    const availableAvatars = getAvailableAvatars();

    // Main application
    return React.createElement('div', {
        style: { minHeight: '100vh', backgroundColor: '#f3f4f6' }
    }, [
        // Header
        React.createElement('div', {
            key: 'header',
            style: { backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }
        }, React.createElement('div', {
            style: { maxWidth: '1200px', margin: '0 auto', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
        }, [
            React.createElement('div', { key: 'title-section' }, [
                React.createElement('h1', {
                    key: 'title',
                    style: { fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }
                }, 'NHH Squash Ladder'),
                React.createElement('p', {
                    key: 'subtitle',
                    style: { color: '#6b7280', margin: '4px 0 0 0' }
                }, currentUserPlayer ? 
                    `Welcome back, ${currentUserPlayer.name}` : 
                    `Welcome, ${user.displayName || user.email}`)
            ]),
            React.createElement('button', {
                key: 'signout',
                onClick: () => auth.signOut(),
                style: {
                    padding: '8px 16px',
                    color: '#6b7280',
                    backgroundColor: 'transparent',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer'
                }
            }, 'Sign Out')
        ])),

        // Main content
        React.createElement('div', {
            key: 'main-content',
            style: { maxWidth: '1200px', margin: '0 auto', padding: '24px' }
        }, [
            // Header with join button
            React.createElement('div', {
                key: 'content-header',
                style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }
            }, [
                React.createElement('h2', {
                    key: 'title',
                    style: { fontSize: '24px', fontWeight: 'bold', margin: 0 }
                }, 'Ladder Rankings'),
                !currentUserPlayer && React.createElement('button', {
                    key: 'join-btn',
                    onClick: () => setShowJoinForm(true),
                    style: {
                        backgroundColor: '#2563eb',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }
                }, 'Join Ladder')
            ]),

            // Current user status
            currentUserPlayer && React.createElement('div', {
                key: 'user-status',
                style: {
                    backgroundColor: '#dcfce7',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '16px'
                }
            }, `You are "${currentUserPlayer.name}" ${currentUserPlayer.avatarEmoji} at position #${currentUserPlayer.position}`),

            // Players table or empty state
            players.length === 0 ? 
                React.createElement('div', {
                    key: 'empty-state',
                    style: { textAlign: 'center', padding: '48px', backgroundColor: 'white', borderRadius: '8px' }
                }, [
                    React.createElement('h3', {
                        key: 'title',
                        style: { fontSize: '18px', fontWeight: '500', color: '#111827', marginBottom: '8px' }
                    }, 'No players in the ladder'),
                    React.createElement('p', {
                        key: 'desc',
                        style: { color: '#6b7280', marginBottom: '24px' }
                    }, 'Be the first to join!'),
                    !currentUserPlayer && React.createElement('button', {
                        key: 'join-btn',
                        onClick: () => setShowJoinForm(true),
                        style: {
                            backgroundColor: '#2563eb',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }
                    }, 'Join Ladder')
                ]) :
                React.createElement('div', {
                    key: 'ladder-table',
                    style: { backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }
                }, [
                    React.createElement('div', {
                        key: 'table-header',
                        style: { 
                            display: 'grid', 
                            gridTemplateColumns: '80px 60px 1fr 120px 80px 100px 80px', 
                            gap: '16px', 
                            padding: '16px', 
                            backgroundColor: '#f9fafb',
                            fontWeight: 'bold'
                        }
                    }, ['Position', '', 'Name', 'Participation', 'Matches', 'Record', 'Win Rate'].map(header => 
                        React.createElement('div', { key: header }, header)
                    )),
                    ...players.map((player, index) => 
                        React.createElement('div', {
                            key: player.id,
                            style: { 
                                display: 'grid', 
                                gridTemplateColumns: '80px 60px 1fr 120px 80px 100px 80px', 
                                gap: '16px', 
                                padding: '16px', 
                                borderTop: '1px solid #e5e7eb',
                                backgroundColor: player.userId === user?.uid ? '#eff6ff' : (index % 2 === 0 ? '#f9fafb' : 'white')
                            }
                        }, [
                            React.createElement('div', {
                                key: 'position',
                                style: { fontWeight: 'bold', fontSize: '18px' }
                            }, `#${player.position}`),
                            React.createElement('div', {
                                key: 'avatar',
                                style: { fontSize: '24px' }
                            }, player.avatarEmoji || '❓'),
                            React.createElement('div', {
                                key: 'name',
                                style: { 
                                    fontWeight: '500',
                                    color: player.userId === user?.uid ? '#1d4ed8' : '#111827'
                                }
                            }, player.name + (player.userId === user?.uid ? ' (You)' : '')),
                            React.createElement('div', {
                                key: 'participation',
                                style: { display: 'flex', alignItems: 'center', gap: '4px' }
                            }, [
                                ...Array(3).fill().map((_, i) => 
                                    React.createElement('div', {
                                        key: i,
                                        style: {
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            backgroundColor: i < (player.participationPoints || 0) ? '#10b981' : '#e5e7eb'
                                        }
                                    })
                                ),
                                React.createElement('span', {
                                    key: 'count',
                                    style: { marginLeft: '8px', fontSize: '14px', color: '#6b7280' }
                                }, `(${player.participationPoints || 0}/3)`)
                            ]),
                            React.createElement('div', { key: 'matches' }, player.totalMatches || 0),
                            React.createElement('div', {
                                key: 'record',
                                style: { display: 'flex', gap: '8px' }
                            }, [
                                React.createElement('span', {
                                    key: 'wins',
                                    style: { color: '#059669', fontWeight: '500' }
                                }, `${player.wins || 0}W`),
                                React.createElement('span', {
                                    key: 'losses',
                                    style: { color: '#dc2626', fontWeight: '500' }
                                }, `${player.losses || 0}L`)
                            ]),
                            React.createElement('div', {
                                key: 'winrate',
                                style: { fontWeight: '500' }
                            }, `${(player.totalMatches || 0) > 0 ? Math.round(((player.wins || 0) / player.totalMatches) * 100) : 0}%`)
                        ])
                    )
                ])
        ]),

        // Join Modal
        showJoinForm && React.createElement('div', {
            key: 'join-modal',
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }
        }, React.createElement('div', {
            style: {
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                width: '500px',
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflowY: 'auto'
            }
        }, [
            React.createElement('h3', {
                key: 'modal-title',
                style: { fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }
            }, 'Join NHH Squash Ladder'),
            
            joinError && React.createElement('div', {
                key: 'error',
                style: {
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '16px'
                }
            }, joinError),
            
            React.createElement('form', {
                key: 'form',
                onSubmit: (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    joinLadder(formData.get('name'));
                }
            }, [
                React.createElement('div', {
                    key: 'name-section',
                    style: { marginBottom: '16px' }
                }, [
                    React.createElement('label', {
                        key: 'label',
                        style: { display: 'block', fontWeight: '500', marginBottom: '8px' }
                    }, 'Display Name'),
                    React.createElement('input', {
                        key: 'input',
                        type: 'text',
                        name: 'name',
                        placeholder: 'Choose a unique name (2-20 characters)',
                        style: {
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '16px'
                        },
                        required: true
                    })
                ]),
                
                React.createElement('div', {
                    key: 'avatar-section',
                    style: { marginBottom: '16px' }
                }, [
                    React.createElement('label', {
                        key: 'label',
                        style: { display: 'block', fontWeight: '500', marginBottom: '8px' }
                    }, `Choose Your Avatar (${availableAvatars.length} available)`),
                    React.createElement('div', {
                        key: 'grid',
                        style: { 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(4, 1fr)', 
                            gap: '8px' 
                        }
                    }, availableAvatars.map(avatar => 
                        React.createElement('button', {
                            key: avatar.id,
                            type: 'button',
                            onClick: () => setSelectedAvatar(avatar.id),
                            style: {
                                padding: '12px',
                                border: selectedAvatar === avatar.id ? '2px solid #2563eb' : '1px solid #d1d5db',
                                borderRadius: '6px',
                                backgroundColor: selectedAvatar === avatar.id ? '#eff6ff' : 'white',
                                cursor: 'pointer',
                                textAlign: 'center'
                            }
                        }, [
                            React.createElement('div', {
                                key: 'emoji',
                                style: { fontSize: '24px', marginBottom: '4px' }
                            }, avatar.emoji),
                            React.createElement('div', {
                                key: 'name',
                                style: { fontSize: '12px', color: '#6b7280' }
                            }, avatar.name)
                        ])
                    ))
                ]),
                
                React.createElement('div', {
                    key: 'buttons',
                    style: { display: 'flex', gap: '8px' }
                }, [
                    React.createElement('button', {
                        key: 'submit',
                        type: 'submit',
                        style: {
                            backgroundColor: '#2563eb',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            flex: 1
                        }
                    }, 'Join Ladder'),
                    React.createElement('button', {
                        key: 'cancel',
                        type: 'button',
                        onClick: () => {
                            setShowJoinForm(false);
                            setSelectedAvatar('');
                            setJoinError('');
                        },
                        style: {
                            backgroundColor: '#d1d5db',
                            color: '#374151',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            flex: 1
                        }
                    }, 'Cancel')
                ])
            ])
        ]))
    ]);
};

// Wait for libraries to load, then render
if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
    ReactDOM.render(React.createElement(NHHSquashLadder), document.getElementById('root'));
} else {
    // Fallback: wait for libraries to load
    const checkLibraries = () => {
        if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
            ReactDOM.render(React.createElement(NHHSquashLadder), document.getElementById('root'));
        } else {
            setTimeout(checkLibraries, 100);
        }
    };
    checkLibraries();
}