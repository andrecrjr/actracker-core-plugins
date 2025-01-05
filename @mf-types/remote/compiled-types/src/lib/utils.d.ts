import type { Habit } from '@/types/habits';
import { type ClassValue } from 'clsx';
export declare function cn(...inputs: ClassValue[]): string;
export declare const getAllActiveHabits: () => Habit[];
export declare const archiveHabitById: (habitId: string) => Habit[];
export declare const createHabit: (newHabit: Habit) => Habit[];
export declare const updateHabit: (updatedHabit: Habit) => Habit[];
export declare const updateHabitPartial: (
  habitId: string,
  updates: Partial<Habit>,
) => Habit[];
