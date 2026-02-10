import { endOfDay, startOfDay } from 'date-fns';
import { getDBConnection } from './database';
import { FilterType, Reminder } from './types';

export const getReminders = async (searchQuery: string = '', categoryId: number | null = null, filterType: FilterType = 'all'): Promise<Reminder[]> => {
    const db = await getDBConnection();

    let query = 'SELECT * FROM reminders WHERE 1=1';
    const params: any[] = [];

    if (searchQuery) {
        query += ' AND (title LIKE ? OR description LIKE ?)';
        params.push(`%${searchQuery}%`, `%${searchQuery}%`);
    }

    if (categoryId) {
        query += ' AND categoryId = ?';
        params.push(categoryId);
    }

    const todayStart = startOfDay(new Date()).getTime();
    const todayEnd = endOfDay(new Date()).getTime();

    switch (filterType) {
        case 'today':
            // Due today or overdue, and not completed
            query += ' AND isCompleted = 0 AND (dueDate <= ? OR dueDate IS NULL)'; // Assuming NULL is "someday" but usually we want specific date. Let's say NULL is OK for "Today" if we treat it as inbox? No, standard is due date.
            // Let's say "Today" = Due <= EndOfToday.
            params.push(todayEnd);
            break;
        case 'upcoming':
            // Due after today, and not completed
            query += ' AND isCompleted = 0 AND dueDate > ?';
            params.push(todayEnd);
            break;
        case 'flagged':
            // Priority > 0, not completed
            query += ' AND isCompleted = 0 AND priority > 0';
            break;
        case 'completed':
            query += ' AND isCompleted = 1';
            break;
        case 'all':
        default:
            // Show all active? Or really ALL?
            // Let's default to "All Active" if not specified, 
            // but user might want to see completed in "All" list?
            // Usually "All" = Inbox + Scheduled.
            // Let's keep it inclusive but maybe hide completed?
            // If filterType is 'all', let's return EVERYTHING (as before) but maybe check isCompleted?
            // Original code returned everything.
            // But if we have a "Completed" tab, "All" usually implies "Active".
            // Let's filter isCompleted=0 for 'all'.
            query += ' AND isCompleted = 0';
            break;
    }

    query += ' ORDER BY dueDate ASC';

    const result = await db.getAllAsync<Reminder>(query, params);
    return result;
};

export const getRemindersByDate = async (startTime: number, endTime: number): Promise<Reminder[]> => {
    const db = await getDBConnection();
    const result = await db.getAllAsync<Reminder>(
        'SELECT * FROM reminders WHERE dueDate >= ? AND dueDate <= ? ORDER BY dueDate ASC',
        [startTime, endTime]
    );
    return result;
};

export const getReminderById = async (id: number): Promise<Reminder | null> => {
    const db = await getDBConnection();
    const result = await db.getFirstAsync<Reminder>('SELECT * FROM reminders WHERE id = ?', [id]);
    return result;
};

export const addReminder = async (reminder: Omit<Reminder, 'id'>): Promise<number> => {
    const db = await getDBConnection();
    const {
        title,
        description,
        dueDate,
        isAllDay,
        priority,
        categoryId,
        isCompleted,
        repeatType,
        snoozeInterval,
        createdAt,
        notificationSound,
    } = reminder;

    const result = await db.runAsync(
        `INSERT INTO reminders (title, description, dueDate, isAllDay, priority, categoryId, isCompleted, repeatType, snoozeInterval, createdAt, notificationSound)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            title,
            description ?? null,
            dueDate ?? null,
            isAllDay,
            priority,
            categoryId,
            isCompleted,
            repeatType ?? 'none',
            snoozeInterval ?? null,
            createdAt,
            notificationSound ?? 'default',
        ]
    );
    return result.lastInsertRowId;
};

export const updateReminder = async (id: number, reminder: Partial<Reminder>): Promise<void> => {
    const db = await getDBConnection();

    // Construct dynamic query
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(reminder)) {
        if (key !== 'id') {
            fields.push(`${key} = ?`);
            values.push(value);
        }
    }

    if (fields.length === 0) return;

    values.push(id);

    await db.runAsync(
        `UPDATE reminders SET ${fields.join(', ')} WHERE id = ?`,
        values
    );
};

export const deleteReminder = async (id: number): Promise<void> => {
    const db = await getDBConnection();
    await db.runAsync('DELETE FROM reminders WHERE id = ?', [id]);
};


export const toggleReminderCompletion = async (id: number, isCompleted: boolean): Promise<void> => {
    const db = await getDBConnection();
    await db.runAsync(
        'UPDATE reminders SET isCompleted = ? WHERE id = ?',
        [isCompleted ? 1 : 0, id]
    );

    if (isCompleted) {
        const reminder = await getReminderById(id);
        if (reminder && reminder.repeatType && reminder.repeatType !== 'none' && reminder.dueDate) {
            let nextDate = new Date(reminder.dueDate);

            switch (reminder.repeatType) {
                case 'daily':
                    nextDate.setDate(nextDate.getDate() + 1);
                    break;
                case 'weekly':
                    nextDate.setDate(nextDate.getDate() + 7);
                    break;
                case 'monthly':
                    nextDate.setMonth(nextDate.getMonth() + 1);
                    break;
                // 'custom' logic can be added later if needed
            }

            await addReminder({
                ...reminder,
                dueDate: nextDate.getTime(),
                isCompleted: 0,
                // Ensure we don't copy the ID
            });
        }
    }
};

// Subtasks
import { Subtask } from './types';

export const getSubtasks = async (reminderId: number): Promise<Subtask[]> => {
    const db = await getDBConnection();
    return db.getAllAsync<Subtask>('SELECT * FROM subtasks WHERE reminderId = ? ORDER BY createdAt ASC', [reminderId]);
};

export const addSubtask = async (subtask: Omit<Subtask, 'id'>): Promise<number> => {
    const db = await getDBConnection();
    const result = await db.runAsync(
        'INSERT INTO subtasks (reminderId, title, isCompleted, createdAt) VALUES (?, ?, ?, ?)',
        [subtask.reminderId, subtask.title, subtask.isCompleted, subtask.createdAt]
    );
    return result.lastInsertRowId;
};

export const toggleSubtask = async (id: number, isCompleted: boolean): Promise<void> => {
    const db = await getDBConnection();
    await db.runAsync('UPDATE subtasks SET isCompleted = ? WHERE id = ?', [isCompleted ? 1 : 0, id]);
};

export const deleteSubtask = async (id: number): Promise<void> => {
    const db = await getDBConnection();
    await db.runAsync('DELETE FROM subtasks WHERE id = ?', [id]);
};

export const clearSubtasks = async (reminderId: number): Promise<void> => {
    const db = await getDBConnection();
    await db.runAsync('DELETE FROM subtasks WHERE reminderId = ?', [reminderId]);
};

export const getStatistics = async () => {
    const db = await getDBConnection();
    const totalResult = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM reminders');
    const completedResult = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM reminders WHERE isCompleted = 1');
    const highPriorityResult = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM reminders WHERE priority = 2 AND isCompleted = 0');

    // Group by Category
    const categoryStats = await db.getAllAsync<{ categoryId: number, count: number }>('SELECT categoryId, COUNT(*) as count FROM reminders WHERE isCompleted = 0 GROUP BY categoryId');

    const total = totalResult?.count || 0;
    const completed = completedResult?.count || 0;
    const active = total - completed;
    const highPriority = highPriorityResult?.count || 0;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
        total,
        completed,
        active,
        highPriority,
        completionRate,
        categoryStats
    };
};
