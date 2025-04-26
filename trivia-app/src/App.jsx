import React, { useState } from 'react';
import './App.css';

const categories = [
  { id: 9, name: 'General Knowledge' },
  { id: 21, name: 'Sports' },
  { id: 23, name: 'History' },
  { id: 17, name: 'Science & Nature' }
];

const difficulties = ['easy', 'medium', 'hard'];

export default function App() {
  const [formState, setFormState] = useState({
    name: '',
    category: '',
    difficulty: ''
  });
  const [questionData, setQuestionData] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleStartQuiz = async (e) => {
    e.preventDefault();
    if (!formState.name || !formState.category || !formState.difficulty) {
      setError('All fields are required.');
      return;
    }
    setError('');
    try {
      const res = await fetch(
        `https://opentdb.com/api.php?amount=1&category=${formState.category}&difficulty=${formState.difficulty}&type=multiple`
      );
      const data = await res.json();
      const question = data.results[0];
      const answers = [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5);
      setQuestionData({ ...question, answers });
    } catch (err) {
      setError('Failed to fetch question. Try again.');
    }
  };

  const handleSubmitAnswer = (e) => {
    e.preventDefault();
    if (!selectedAnswer) {
      setError('Please select an answer.');
      return;
    }
    setError('');
    const isCorrect = selectedAnswer === questionData.correct_answer;
    setResult({
      isCorrect,
      correctAnswer: questionData.correct_answer
    });
  };

  const handleRestart = () => {
    setFormState({ name: '', category: '', difficulty: '' });
    setQuestionData(null);
    setSelectedAnswer('');
    setError('');
    setResult(null);
  };

  return (
    <div className="app">
      {!questionData && !result && (
        <form className="form" onSubmit={handleStartQuiz}>
          <h1>Trivia Time</h1>
          <p>Enter your name, pick a category and difficulty, then test your knowledge!</p>
          <label>First Name:
            <input name="name" value={formState.name} onChange={handleInputChange} />
          </label>
          <label>Category:
            <select name="category" value={formState.category} onChange={handleInputChange}>
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </label>
          <label>Difficulty:
            <select name="difficulty" value={formState.difficulty} onChange={handleInputChange}>
              <option value="">Select Difficulty</option>
              {difficulties.map(diff => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit">Start Quiz</button>
        </form>
      )}

      {questionData && !result && (
        <form className="form" onSubmit={handleSubmitAnswer}>
          <h2 dangerouslySetInnerHTML={{ __html: questionData.question }} />
          {questionData.answers.map((ans, idx) => (
            <label key={idx}>
              <input
                type="radio"
                name="answer"
                value={ans}
                checked={selectedAnswer === ans}
                onChange={(e) => setSelectedAnswer(e.target.value)}
              />
              <span dangerouslySetInnerHTML={{ __html: ans }} />
            </label>
          ))}
          {error && <p className="error">{error}</p>}
          <button type="submit">Submit Answer</button>
        </form>
      )}

      {result && (
        <div className="result">
          <h2>{result.isCorrect ? `Well done, ${formState.name}!` : `Nice job, ${formState.name}.`}</h2>
          {!result.isCorrect && <p>The correct answer was: <strong dangerouslySetInnerHTML={{ __html: result.correctAnswer }} /></p>}
          <button onClick={handleRestart}>Try Another</button>
        </div>
      )}
    </div>
  );
}
