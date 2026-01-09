import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { theme, commonStyles } from '../styles/theme';
import Button from './Button';
import Input from './Input';
import Badge from './Badge';

function Chatbot({ onComplete, onClose }) {
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [progress, setProgress] = useState({ completion_percentage: 0 });
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    startConversation();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function startConversation() {
    setLoading(true);
    try {
      const res = await api.get('/api/onboarding/chat/');
      setSessionId(res.data.session_id);
      setCurrentQuestion(res.data.question);
      setProgress(res.data.progress);
      
      if (res.data.conversation_history && res.data.conversation_history.length > 0) {
        setMessages(res.data.conversation_history);
      } else {
        // Add welcome message
        setMessages([{
          type: 'bot',
          message: res.data.question?.question || 'Welcome! Let\'s get started.',
          timestamp: new Date().toISOString(),
        }]);
      }
    } catch (err) {
      console.error('Failed to start conversation:', err);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(message, step = null) {
    if (!message.trim() && !step) return;

    // Add user message to chat
    const userMessage = {
      type: 'user',
      message: message || (step === 'file_upload' ? 'Files uploaded' : ''),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const res = await api.post('/api/onboarding/chat/', {
        message: message || '',
        step: step || currentQuestion?.step,
        session_id: sessionId,
      });

      setCurrentQuestion(res.data.question);
      setProgress(res.data.progress);
      
      // Add bot response
      if (res.data.question?.question) {
        setMessages(prev => [...prev, {
          type: 'bot',
          message: res.data.question.question,
          timestamp: new Date().toISOString(),
        }]);
      }

      // Check if complete
      if (res.data.progress?.is_complete) {
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages(prev => [...prev, {
        type: 'bot',
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      }]);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!inputValue.trim() && currentQuestion?.type !== 'file') return;
    
    sendMessage(inputValue);
    setInputValue('');
  }

  function handleOptionSelect(option) {
    sendMessage(option);
  }

  function handleFileUpload(files) {
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    // Upload files to documents API
    api.post('/api/documents/upload/', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(() => {
        sendMessage('Files uploaded', currentQuestion?.step);
        setUploading(false);
      })
      .catch(err => {
        console.error('File upload failed:', err);
        setMessages(prev => [...prev, {
          type: 'bot',
          message: 'Sorry, file upload failed. Please try again.',
          timestamp: new Date().toISOString(),
        }]);
        setUploading(false);
      });
  }

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  const questionType = currentQuestion?.type;
  const showFileUpload = questionType === 'file';

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '600px',
      background: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.xl,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      border: `1px solid ${theme.colors.gray200}`,
    }}>
      {/* Header */}
      <div style={{
        padding: theme.spacing.md,
        borderBottom: `1px solid ${theme.colors.gray200}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: theme.colors.primary,
        color: theme.colors.white,
        borderRadius: `${theme.borderRadius.lg} ${theme.borderRadius.lg} 0 0`,
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: theme.typography.fontSize.lg }}>
            BuildFund Assistant 🤖
          </h3>
          {progress.completion_percentage > 0 && (
            <div style={{ fontSize: theme.typography.fontSize.xs, marginTop: theme.spacing.xs }}>
              {progress.completion_percentage}% Complete
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: theme.colors.white,
            fontSize: '20px',
            cursor: 'pointer',
            padding: theme.spacing.xs,
          }}
        >
          ×
        </button>
      </div>

      {/* Progress Bar */}
      {progress.completion_percentage > 0 && (
        <div style={{
          height: '4px',
          background: theme.colors.gray200,
          width: '100%',
        }}>
          <div style={{
            height: '100%',
            background: theme.colors.primary,
            width: `${progress.completion_percentage}%`,
            transition: 'width 0.3s ease',
          }} />
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: theme.spacing.md,
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.md,
        minHeight: '300px',
        maxHeight: '400px',
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: theme.colors.textSecondary }}>
            Loading...
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  background: msg.type === 'user'
                    ? theme.colors.primary
                    : theme.colors.gray100,
                  color: msg.type === 'user'
                    ? theme.colors.white
                    : theme.colors.textPrimary,
                  fontSize: theme.typography.fontSize.sm,
                }}>
                  {msg.message}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* File Upload Area */}
      {showFileUpload && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            margin: theme.spacing.md,
            padding: theme.spacing.lg,
            border: `2px dashed ${dragActive ? theme.colors.primary : theme.colors.gray300}`,
            borderRadius: theme.borderRadius.md,
            textAlign: 'center',
            background: dragActive ? theme.colors.primaryLight : theme.colors.gray50,
            cursor: 'pointer',
            transition: `all ${theme.transitions.fast}`,
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <div style={{ fontSize: '24px', marginBottom: theme.spacing.sm }}>📎</div>
          <div style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>
            Drag and drop files here or click to browse
          </div>
        </div>
      )}

      {/* Input Area */}
      {!showFileUpload && currentQuestion && (
        <div style={{
          padding: theme.spacing.md,
          borderTop: `1px solid ${theme.colors.gray200}`,
        }}>
          {currentQuestion.type === 'select' && currentQuestion.options ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
              {currentQuestion.options.map((option, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => handleOptionSelect(option)}
                  style={{ width: '100%', textAlign: 'left' }}
                >
                  {option}
                </Button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                <input
                  type={currentQuestion.type === 'date' ? 'date' : currentQuestion.type === 'number' ? 'number' : 'text'}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={currentQuestion.type === 'date' ? 'DD/MM/YYYY' : 'Type your answer...'}
                  style={{
                    flex: 1,
                    padding: theme.spacing.sm,
                    border: `1px solid ${theme.colors.gray300}`,
                    borderRadius: theme.borderRadius.md,
                    fontSize: theme.typography.fontSize.sm,
                  }}
                  required={currentQuestion.required}
                />
                <Button type="submit" variant="primary" size="sm">
                  Send
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {uploading && (
        <div style={{
          padding: theme.spacing.sm,
          textAlign: 'center',
          color: theme.colors.textSecondary,
          fontSize: theme.typography.fontSize.sm,
        }}>
          Uploading files...
        </div>
      )}
    </div>
  );
}

export default Chatbot;
