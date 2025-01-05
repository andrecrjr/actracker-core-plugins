import React from 'react';
import { Button } from 'remote/Button';
import Component from 'remote/Components';

const ReminderPlugin = () => {
  console.log('de dentro do plugin');
  return (
    <>
      <Button
        type="button"
        onClick={() => {
          console.log(
            'set local storage',
            localStorage.setItem('reminderPlugin', 'true remote'),
          );
        }}
      >
        Remote Button
      </Button>
      <Component.Input />
    </>
  );
};

export default ReminderPlugin;
