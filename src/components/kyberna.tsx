import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface TimetableEvent {
  Day: string;
  Subject: string;
  Time: string;
  Room: string;
  Teacher: string;
  Group: string;
  Status: string;
}

const Kyberna: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [loginError, setLoginError] = useState('');
  const [date, setDate] = useState('');
  const [staticFlag, setStaticFlag] = useState(false);
  const [timetable, setTimetable] = useState<TimetableEvent[]>([]);
  const [compareDate, setCompareDate] = useState('');
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE = "https://kyb.demiffy.com:8543";

  useEffect(() => {
    const savedToken = Cookies.get('token');
    if (savedToken) setToken(savedToken);
  }, []);

  const handleLogin = async () => {
    setLoginError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        Cookies.set('token', data.token, { expires: 7 });
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (err) {
      setLoginError('Error logging in');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetable = async () => {
    setApiError('');
    if (!token) {
      setApiError('Please log in first.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/timetable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ date, static: staticFlag }),
      });
      const data = await res.json();
      if (data.error) {
        setApiError(data.error);
      } else {
        setTimetable(data);
      }
    } catch (err) {
      setApiError('Error fetching timetable');
    } finally {
      setLoading(false);
    }
  };

  const compareTimetable = async () => {
    setApiError('');
    if (!token) {
      setApiError('Please log in first.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/compare_timetable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ date: compareDate, static: staticFlag }),
      });
      const data = await res.json();
      if (data.error) {
        setApiError(data.error);
      } else {
        setComparisonResult(data);
      }
    } catch (err) {
      setApiError('Error comparing timetable');
    } finally {
      setLoading(false);
    }
  };

  const groupEventsByDay = (events: TimetableEvent[]) => {
    const grouped: { [day: string]: TimetableEvent[] } = {};
    events.forEach(event => {
      if (!grouped[event.Day]) grouped[event.Day] = [];
      grouped[event.Day].push(event);
    });
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => {
        const parseTime = (t: string) => {
          const [h, m] = t.split(':').map(Number);
          return h * 60 + m;
        };
        return parseTime(a.Time) - parseTime(b.Time);
      });
    });
    return grouped;
  };

  const renderLoading = () => (
    <div className="flex justify-center items-center my-4">
      <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const renderTimetable = () => {
    if (timetable.length === 0) return null;
    const grouped = groupEventsByDay(timetable);
    return (
      <div className="overflow-x-auto">
        <div className="flex space-x-4">
          {Object.entries(grouped).map(([day, events]) => (
            <div key={day} className="min-w-[200px] bg-gray-800 p-4 rounded shadow-lg">
              <h3 className="text-xl font-bold border-b border-gray-700 pb-2 mb-4 text-blue-400 text-center">
                {day}
              </h3>
              {events.map((event, idx) => (
                <div key={idx} className="border border-gray-700 p-2 mb-3 rounded hover:bg-gray-700">
                  <p className="font-semibold">{event.Subject}</p>
                  <p className="text-sm">{event.Time}</p>
                  <p className="text-xs text-gray-400">{event.Room} {event.Teacher && `- ${event.Teacher}`}</p>
                  {event.Group && <p className="text-xs text-gray-500">Group: {event.Group}</p>}
                  {event.Status && <p className="text-xs text-red-400">Status: {event.Status}</p>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderComparison = () => {
    if (!comparisonResult) return null;
    if (!comparisonResult.changed) {
      return <p className="text-gray-400">No changes detected.</p>;
    }
    return (
      <div>
        <p className="text-green-500 font-bold">Changes Detected!</p>
        {comparisonResult.added && comparisonResult.added.length > 0 && (
          <div className="mt-4">
            <h3 className="font-bold">Added:</h3>
            <ul className="list-disc ml-4">
              {comparisonResult.added.map((item: any, idx: number) => (
                <li key={idx}>
                  {item.Day}: {item.Subject} - {item.Time}
                </li>
              ))}
            </ul>
          </div>
        )}
        {comparisonResult.removed && comparisonResult.removed.length > 0 && (
          <div className="mt-4">
            <h3 className="font-bold">Removed:</h3>
            <ul className="list-disc ml-4">
              {comparisonResult.removed.map((item: any, idx: number) => (
                <li key={idx}>
                  {item.Day}: {item.Subject} - {item.Time}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-blue-500 text-center">Kyberna Timetable [PROTOTYPE]</h1>

        {!token ? (
          <div className="bg-gray-900 p-6 rounded mb-8 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Login</h2>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded mb-4"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded mb-4"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-blue-900 hover:bg-blue-800 p-3 rounded text-lg"
            >
              Login
            </button>
            {loginError && <p className="text-red-500 mt-4">{loginError}</p>}
          </div>
        ) : (
          <>
            <div className="bg-gray-900 p-6 rounded mb-8 shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">Fetch Timetable</h2>
              <label className="block mb-2">Date (YYYY-MM-DD):</label>
              <input
                type="text"
                placeholder="2025-03-20"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded mb-4"
              />
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={staticFlag}
                  onChange={(e) => setStaticFlag(e.target.checked)}
                  className="mr-2"
                />
                <span>Static</span>
              </div>
              <button
                onClick={fetchTimetable}
                className="w-full bg-blue-900 hover:bg-blue-800 p-3 rounded text-lg"
              >
                Fetch Timetable
              </button>
            </div>

            <div className="bg-gray-900 p-6 rounded mb-8 shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">Compare Timetable</h2>
              <label className="block mb-2">New Date (YYYY-MM-DD):</label>
              <input
                type="text"
                placeholder="2025-03-30"
                value={compareDate}
                onChange={(e) => setCompareDate(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded mb-4"
              />
              <button
                onClick={compareTimetable}
                className="w-full bg-blue-900 hover:bg-blue-800 p-3 rounded text-lg"
              >
                Compare Timetable
              </button>
            </div>
          </>
        )}

        {loading && renderLoading()}

        {apiError && (
          <div className="bg-red-700 p-4 rounded mb-8 shadow-lg">
            <p>{apiError}</p>
          </div>
        )}

        {timetable.length > 0 && (
          <div className="bg-gray-800 p-4 rounded mb-8 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Timetable</h2>
            {renderTimetable()}
          </div>
        )}

        {comparisonResult && (
          <div className="bg-gray-800 p-4 rounded mb-8 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Comparison Result</h2>
            {renderComparison()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Kyberna;