import { getDBConnection } from './database';
import { Category } from './types';

export const getCategories = async (): Promise<Category[]> => {
    const db = await getDBConnection();
    const result = await db.getAllAsync<Category>('SELECT * FROM categories');
    return result;
};

export const addCategory = async (name: string, color: string, icon: string): Promise<number> => {
    const db = await getDBConnection();
    const result = await db.runAsync(
        'INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)',
        [name, color, icon]
    );
    return result.lastInsertRowId;
};

export const updateCategory = async (id: number, name: string, color: string, icon: string): Promise<void> => {
    const db = await getDBConnection();
    await db.runAsync(
        'UPDATE categories SET name = ?, color = ?, icon = ? WHERE id = ?',
        [name, color, icon, id]
    );
};

export const deleteCategory = async (id: number): Promise<void> => {
    const db = await getDBConnection();
    await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
};
