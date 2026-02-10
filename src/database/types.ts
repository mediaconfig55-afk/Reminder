export interface Category {
    id: number;
    name: string;
    color: string;
    icon: string;
}

export interface Reminder {
    id: number;
    title: string;
    description?: string;
    dueDate?: number; // Unix timestamp
    isAllDay: number; // 0 or 1
    priority: number; // 0, 1, 2
    categoryId: number;
    isCompleted: number; // 0 or 1
    repeatType?: 'daily' | 'weekly' | 'monthly' | 'custom' | 'none';
    snoozeInterval?: number;
    createdAt: number;
    notificationSound?: string;
}

export interface Subtask {
    id: number;
    reminderId: number;
    title: string;
    isCompleted: number; // 0 or 1
    createdAt: number;
}

export type FilterType = 'all' | 'today' | 'upcoming' | 'flagged' | 'completed';
