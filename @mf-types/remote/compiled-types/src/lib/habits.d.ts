import type { Habit } from '@/types/habits';
export declare function generateHabitId(): string;
export interface HabitOrder {
  [date: string]: string[];
}
export declare function getHabitsFromStorage(): Habit[];
export declare function getHabitOrderFromStorage(): HabitOrder;
export declare function saveHabitsToStorage(habits: Habit[]): void;
export declare function saveHabitOrderToStorage(order: HabitOrder): void;
export declare function archiveHabit(habits: Habit[], habitId: string): Habit[];
export declare function getActiveHabits(habits: Habit[]): Habit[];
export declare function getActiveListHabits(): Habit[];
export declare function getArchivedHabits(habits: Habit[]): Habit[];
