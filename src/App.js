import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const Background = () => {
  return (
    <div className="background">
      <div className="gradient-bg">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            '--delay': `${Math.random() * 4}s`,
            '--size': `${Math.random() * 100 + 50}px`,
            '--left': `${Math.random() * 100}%`,
            '--top': `${Math.random() * 100}%`,
          }} />
        ))}
      </div>
    </div>
  );
};

const MusicPlayer = ({ isPlaying, toggleMusic, isLoaded }) => {
  return (
    <button 
      className={`music-toggle ${isPlaying ? 'playing' : ''}`}
      onClick={toggleMusic}
      aria-label={isPlaying ? 'Pause Music' : 'Play Music'}
      disabled={!isLoaded}
    >
      <span className="music-icon">♪</span>
    </button>
  );
};

const Guestbook = ({ messages, addMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim() && name.trim()) {
      addMessage({ name, message: newMessage, timestamp: new Date().toISOString() });
      setNewMessage('');
      setName('');
    }
  };

  return (
    <div className="guestbook">
      <h2 className="guestbook-title">Leave a Message</h2>
      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          className="input-field"
          required
        />
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Write your message..."
          className="input-field"
          required
        />
        <button type="submit" className="btn">Send Message</button>
      </form>
      <div className="messages-list">
        {messages.map((msg, index) => (
          <div key={msg.id} className="message-card">
            <p className="message-text">{msg.message}</p>
            <div className="message-meta">
              <span className="message-author">- {msg.name}</span>
              <span className="message-date">
                {new Date(msg.timestamp).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AUDIO_URL = 'meow.mp3'; // Using a placeholder URL for testing

function App() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [activeSection, setActiveSection] = useState('main');
  const [typed, setTyped] = useState('');
  const [currentChar, setCurrentChar] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const audioRef = React.useRef(null);
  
  // Initialize guestMessages from localStorage or empty array
  const [guestMessages, setGuestMessages] = useState(() => {
    const savedMessages = localStorage.getItem('guestbookMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('guestbookMessages', JSON.stringify(guestMessages));
  }, [guestMessages]);

  const addGuestMessage = (message) => {
    const newMessage = {
      ...message,
      id: Date.now(), // Add unique ID for each message
    };
    setGuestMessages(prev => [newMessage, ...prev]);
  };

  // Add function to clear all messages (optional, for testing)
  const clearGuestbook = () => {
    if (window.confirm('Are you sure you want to clear all messages?')) {
      setGuestMessages([]);
      localStorage.removeItem('guestbookMessages');
    }
  };

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio(AUDIO_URL);
    audioRef.current.loop = true;
    
    // Add event listeners
    audioRef.current.addEventListener('canplaythrough', () => {
      setAudioLoaded(true);
    });

    audioRef.current.addEventListener('error', (e) => {
      console.error('Error loading audio:', e);
      setAudioLoaded(false);
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const createHeart = useCallback((x, y) => {
    const heart = document.createElement('div');
    heart.className = 'heart-confetti';
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';
    document.body.appendChild(heart);

    heart.addEventListener('animationend', () => {
      heart.remove();
    });
  }, []);

  const handleClick = useCallback((e) => {
    const x = e.clientX;
    const y = e.clientY;
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        createHeart(x, y);
      }, i * 50);
    }
  }, [createHeart]);

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [handleClick]);

  const toggleMusic = () => {
    if (!audioRef.current || !audioLoaded) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Create a user interaction promise
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Audio started playing successfully
          })
          .catch(error => {
            console.error('Error playing audio:', error);
          });
      }
    }
    setIsPlaying(!isPlaying);
  };

  const messages = [
    "Love Sorry, Maglig.on ta lovey sirkol mata.",
    "Meeoww , meowwww meowwww meowwww....",
    "Love Padayona lang na imong pagka sirkol mata",
    "Pretty! Nene",
    "Iloveyou! Happy Anniversarry!"
  ];

  const memories = [
    { title: "First Date", text: "First Date as lovey na kay ddtua jud sa barbequehan sa may ngitngit HAHAH" },
    { title: "Kita na!", text: "Ddtua sa simbahan iyat kyka" },
    { title: "Our Adventures", text: "Adventure nato kay wala kaayo pero naa kadtong gibaktas natong seawall hahahah" },
    { title: "Little Moments", text: "Cuddleess! sa dalan HAHAHHA" }
  ];

  useEffect(() => {
    if (currentChar < messages[currentMessageIndex].length) {
      const timer = setTimeout(() => {
        setTyped(prev => prev + messages[currentMessageIndex][currentChar]);
        setCurrentChar(prev => prev + 1);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentChar, currentMessageIndex, messages]);

  const handleNextMessage = () => {
    setShowMessage(false);
    setTyped('');
    setCurrentChar(0);
    setTimeout(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      setShowMessage(true);
    }, 500);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const renderMemories = () => (
    <div className="memories-grid">
      {memories.map((memory, index) => (
        <div 
          key={index} 
          className="memory-card"
          style={{ animationDelay: `${index * 0.2}s` }}
        >
          <h3>{memory.title}</h3>
          <p>{memory.text}</p>
        </div>
      ))}
    </div>
  );

  const renderMainContent = () => (
    <>
      <div className="date">February 14, 2025</div>
      <div className="content">
        <h1 className="title">Happy Valentine's Day</h1>
        <div className="divider">
          <span className="line"></span>
          <span className="ampersand">&</span>
          <span className="line"></span>
        </div>
        <h1 className="title anniversary">Happy Anniversary</h1>
        
        <div className={`message ${showMessage ? 'show' : ''}`}>
          {typed}
        </div>

        <div className="button-group">
          <button 
            className="btn"
            onClick={handleNextMessage}
            aria-label="Next message"
          >
            <span className="btn-text">Next Message</span>
          </button>
          <button 
            className="btn secondary"
            onClick={() => handleSectionChange('memories')}
          >
            <span className="btn-text">View Our Memories</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Background />
      <MusicPlayer 
        isPlaying={isPlaying} 
        toggleMusic={toggleMusic}
        isLoaded={audioLoaded}
      />
      <div className="container">
        <div className="elegant-border">
          <div className="card">
            {activeSection === 'main' && renderMainContent()}
            {activeSection === 'memories' && renderMemories()}
            {activeSection === 'guestbook' && (
              <>
                <Guestbook 
                  messages={guestMessages} 
                  addMessage={addGuestMessage} 
                />
                {guestMessages.length > 0 && (
                  <button 
                    className="btn clear-btn" 
                    onClick={clearGuestbook}
                    style={{ marginTop: '20px' }}
                  >
                    Clear All Messages
                  </button>
                )}
              </>
            )}
            
            <div className="nav-buttons">
              {activeSection !== 'main' && (
                <button 
                  className="btn back-btn"
                  onClick={() => handleSectionChange('main')}
                >
                  <span className="btn-text">Back to Card</span>
                </button>
              )}
              {activeSection === 'main' && (
                <button 
                  className="btn secondary"
                  onClick={() => handleSectionChange('guestbook')}
                >
                  <span className="btn-text">Chat with Love</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
