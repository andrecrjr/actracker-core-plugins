import React, { useState, useEffect } from 'react';
import { Habit, HabitPlugin } from 'remote/types';
import { formatDate } from 'remote/utils';

export let wakatimePlugin: HabitPlugin = {
  id: 'wakatime-plugin',
  name: 'WakaTime Integration',
  description: 'Track your daily coding activity from WakaTime.',
  version: '1.0.0',
  settings: {
    enabled: true,
    apiKey: '', // Placeholder for the user's API key
  },

  // Render additional content in the habit card
  RenderHabitCard(habit: Habit, date: Date) {
    return <WakaTimeStats habit={habit} date={date} />;
  },

  // Render settings form for the plugin
  RenderHabitForm(
    habit: Habit | null,
    handleSettingChange: (updatedHabit: Habit) => void,
  ) {
    return (
      <WakaTimeSettings
        habit={habit}
        handleSettingChange={handleSettingChange}
      />
    );
  },
};

let WakaTimeSettings = ({
  habit,
  handleSettingChange,
}: {
  habit: Habit | null;
  handleSettingChange: (updatedHabit: Habit) => void;
}) => {
  let [apiKey, setApiKey] = useState(
    habit?.pluginData?.['wakatime-plugin']?.apiKey || '',
  );

  let handleSave = () => {
    habit &&
      handleSettingChange({
        ...habit,
        pluginData: {
          ...habit.pluginData,
          'wakatime-plugin': {
            apiKey,
          },
        },
      });
  };

  return (
    <div>
      <h3>WakaTime API Key</h3>
      <input
        type="text"
        value={apiKey}
        onChange={e => setApiKey(e.target.value)}
        placeholder="Enter your WakaTime API key"
      />
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

let WakaTimeStats = ({ habit, date }: { habit: Habit; date: Date }) => {
  let [codingStats, setCodingStats] = useState<any>(null);
  let [loading, setLoading] = useState(true);
  let [error, setError] = useState('');

  useEffect(() => {
    let fetchStats = async () => {
      try {
        let apiKey = habit?.pluginData?.['wakatime-plugin']?.apiKey;
        if (!apiKey) {
          setError('API key not set. Please configure the plugin.');
          setLoading(false);
          return;
        }

        let currentDate = formatDate(date);
        let response = await fetch(
          `https://wakatime.com/api/v1/users/current/summaries?start=${currentDate}&end=${currentDate}`,
          {
            headers: {
              Authorization: `Basic ${btoa(apiKey)}`,
            },
          },
        );

        if (!response.ok) {
          setError('Failed to fetch WakaTime data. Check your API key.');
          setLoading(false);
          return;
        }

        let data = await response.json();
        setCodingStats(data.data[0]); // Assuming the API returns data for the day
      } catch (err) {
        setError('An error occurred while fetching WakaTime data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [habit, date]);

  if (loading) return <div>Loading WakaTime stats...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h4>WakaTime Stats</h4>
      {codingStats ? (
        <>
          <p>Total Time: {codingStats.grand_total.text}</p>
          <p>Languages:</p>
          <ul>
            {codingStats.languages.map((lang: any) => (
              <li key={lang.name}>
                {lang.name}: {lang.total_seconds / 60} minutes
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>No coding activity recorded today.</p>
      )}
    </div>
  );
};

export default wakatimePlugin;
