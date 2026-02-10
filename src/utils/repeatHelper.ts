import { addDays, addMonths, addWeeks } from 'date-fns';

export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

export const getNextRepeatDate = (currentDate: number, repeatType: RepeatType): number | null => {
    if (repeatType === 'none') return null;

    const date = new Date(currentDate);

    switch (repeatType) {
        case 'daily':
            return addDays(date, 1).getTime();
        case 'weekly':
            return addWeeks(date, 1).getTime();
        case 'monthly':
            return addMonths(date, 1).getTime();
        default:
            return null;
    }
};

export const getRepeatLabel = (repeatType: RepeatType): string => {
    switch (repeatType) {
        case 'daily':
            return 'Her Gün';
        case 'weekly':
            return 'Her Hafta';
        case 'monthly':
            return 'Her Ay';
        case 'none':
        default:
            return 'Tekrarlanmaz';
    }
};
