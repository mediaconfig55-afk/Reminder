import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

const dbName = 'reminders.db';

// Global scope for HMR resilience on web
const globalAny: any = global;
let dbInstance: SQLite.SQLiteDatabase | null = globalAny._dbInstance || null;

export const getDBConnection = async () => {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    dbInstance = await SQLite.openDatabaseAsync(dbName);
  } catch (error: any) {
    if (Platform.OS === 'web') {
      console.error(`
      ===================================================================
      VERİTABANI HATASI: Tarayıcı dosya kilitleme sorunu.
      Lütfen bu uygulamanın açık olduğu DİĞER TÜM SEKMELERİ KAPATIN.
      Ardından bu sayfayı yenileyin.
      ===================================================================
      `);
    }
    throw error;
  }

  // Save to global to survive HMR
  if (Platform.OS === 'web') {
    globalAny._dbInstance = dbInstance;
  }

  return dbInstance;
};

export const initDatabase = async () => {
  const db = await getDBConnection();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      icon TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      dueDate INTEGER,
      isAllDay INTEGER DEFAULT 0,
      priority INTEGER DEFAULT 0,
      categoryId INTEGER,
      isCompleted INTEGER DEFAULT 0,
      repeatType TEXT,
      snoozeInterval INTEGER,
      createdAt INTEGER,
      notificationSound TEXT DEFAULT 'default',
      FOREIGN KEY (categoryId) REFERENCES categories (id)
    );

    CREATE TABLE IF NOT EXISTS subtasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reminderId INTEGER NOT NULL,
      title TEXT NOT NULL,
      isCompleted INTEGER DEFAULT 0,
      createdAt INTEGER,
      FOREIGN KEY (reminderId) REFERENCES reminders (id) ON DELETE CASCADE
    );

    // Check for schema updates (simple migration)
    try {
      const tableInfo = await db.getAllAsync('PRAGMA table_info(reminders)');
      // @ts-ignore
      const hasSoundColumn = tableInfo.some(col => col.name === 'notificationSound');
      if (!hasSoundColumn) {
        await db.execAsync("ALTER TABLE reminders ADD COLUMN notificationSound TEXT DEFAULT 'default'");
      }
    } catch (e) {
      console.log('Migration check failed or not needed', e);
    }

    INSERT OR IGNORE INTO categories (id, name, color, icon) VALUES (1, 'Genel', '#2196F3', 'inbox');
    INSERT OR IGNORE INTO categories (id, name, color, icon) VALUES (2, 'İş', '#4CAF50', 'briefcase');
    INSERT OR IGNORE INTO categories (id, name, color, icon) VALUES (3, 'Kişisel', '#FF9800', 'user');
    INSERT OR IGNORE INTO categories (id, name, color, icon) VALUES (4, 'Alışveriş', '#E91E63', 'shopping-cart');
  `);
};
