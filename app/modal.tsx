import { Text, View } from '@/src/components/Themed';
import { Layout } from '@/src/components/ui/Layout';
import { useTheme } from '@/src/context/ThemeContext';
import * as CategoryDB from '@/src/database/categories';
import * as ReminderDB from '@/src/database/reminders';
import { Category } from '@/src/database/types';
import { requestNotificationPermissions, scheduleReminderNotification } from '@/src/utils/notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Plus, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

export default function ModalScreen() {
  const { colors, theme } = useTheme();
  const { id } = useLocalSearchParams();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [priority, setPriority] = useState(0); // 0: None, 1: Medium, 2: High
  const [notificationSound, setNotificationSound] = useState('default');
  const [repeatType, setRepeatType] = useState<'none' | 'daily' | 'weekly' | 'monthly' | 'custom'>('none');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Subtask State
  const [subtasks, setSubtasks] = useState<{ title: string; isCompleted: number }[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    loadCategories();
    if (isEditing) {
      loadReminder(Number(id));
    }
  }, [id]);

  const loadCategories = async () => {
    const data = await CategoryDB.getCategories();
    setCategories(data);
    if (!isEditing && data.length > 0) setCategoryId(data[0].id);
  };

  const loadReminder = async (reminderId: number) => {
    setLoading(true);
    const reminder = await ReminderDB.getReminderById(reminderId);
    if (reminder) {
      setTitle(reminder.title);
      setDescription(reminder.description || '');
      if (reminder.dueDate) setDate(new Date(reminder.dueDate));
      setPriority(reminder.priority);
      setCategoryId(reminder.categoryId);
      setNotificationSound(reminder.notificationSound || 'default');
      setRepeatType((reminder.repeatType as any) || 'none');

      const loadedSubtasks = await ReminderDB.getSubtasks(reminderId);
      setSubtasks(loadedSubtasks.map(st => ({ title: st.title, isCompleted: st.isCompleted })));
    }
    setLoading(false);
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      setSubtasks([...subtasks, { title: newSubtaskTitle.trim(), isCompleted: 0 }]);
      setNewSubtaskTitle('');
    }
  };

  const handleDeleteSubtask = (index: number) => {
    const updated = [...subtasks];
    updated.splice(index, 1);
    setSubtasks(updated);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Lütfen bir başlık girin.');
      return;
    }

    // Request permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      Alert.alert('Uyarı', 'Bildirim izni verilmediği için hatırlatıcı bildirimi çalışmayabilir.');
    }

    try {
      const reminderData: any = {
        title,
        description,
        dueDate: date.getTime(),
        isAllDay: 0,
        priority,
        categoryId: categoryId || 1,
        isCompleted: 0,
        repeatType,
        notificationSound,
        createdAt: isEditing ? undefined : Date.now(),
      };

      let savedId = Number(id);

      if (isEditing) {
        await ReminderDB.updateReminder(savedId, reminderData);
        // Sync subtasks: Clear all and re-insert
        await ReminderDB.clearSubtasks(savedId);
      } else {
        savedId = await ReminderDB.addReminder(reminderData);
      }

      // Save subtasks
      for (const st of subtasks) {
        await ReminderDB.addSubtask({
          reminderId: savedId,
          title: st.title,
          isCompleted: st.isCompleted,
          createdAt: Date.now(),
        });
      }

      // Schedule notification
      await scheduleReminderNotification({ ...reminderData, id: savedId });

      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Hatırlatıcı kaydedilemedi.');
    }
  };

  if (loading) {
    return (
      <Layout style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Yükleniyor...</Text>
      </Layout>
    );
  }

  return (
    <Layout style={styles.container}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.primary, fontSize: 17 }}>İptal</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isEditing ? 'Hatırlatıcı Düzenle' : 'Yeni Hatırlatıcı'}
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 17 }}>
            {isEditing ? 'Kaydet' : 'Ekle'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="Başlık"
          placeholderTextColor={colors.subtext}
          value={title}
          onChangeText={setTitle}
          autoFocus={!isEditing}
        />

        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, height: 80 }]}
          placeholder="Notlar"
          placeholderTextColor={colors.subtext}
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {/* Date & Time */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: colors.text }}>Tarih</Text>
            <Text style={{ color: colors.primary }}>{format(date, 'd MMMM yyyy', { locale: tr })}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border }]}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={{ color: colors.text }}>Saat</Text>
            <Text style={{ color: colors.primary }}>{format(date, 'HH:mm')}</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            display="default"
            onChange={(event, selectedDate) => {
              setShowTimePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        {/* Priority */}
        <Text style={[styles.sectionTitle, { color: colors.subtext }]}>Öncelik</Text>
        <View style={[styles.chipContainer]}>
          {[0, 1, 2].map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.chip,
                priority === p ? { backgroundColor: colors.primary } : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }
              ]}
              onPress={() => setPriority(p)}
            >
              <Text style={{ color: priority === p ? '#000' : colors.text }}>
                {p === 0 ? 'Düşük' : p === 1 ? 'Orta' : 'Yüksek'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Repeat */}
        <Text style={[styles.sectionTitle, { color: colors.subtext }]}>Tekrar</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {['none', 'daily', 'weekly', 'monthly'].map((rpt) => (
            <TouchableOpacity
              key={rpt}
              style={[
                styles.chip,
                repeatType === rpt ? { backgroundColor: colors.primary } : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }
              ]}
              onPress={() => setRepeatType(rpt as any)}
            >
              <Text style={{ color: repeatType === rpt ? '#000' : colors.text }}>
                {rpt === 'none' ? 'Yok' : rpt === 'daily' ? 'Günlük' : rpt === 'weekly' ? 'Haftalık' : 'Aylık'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Subtasks */}
        <Text style={[styles.sectionTitle, { color: colors.subtext }]}>Alt Görevler</Text>
        <View style={[styles.section, { backgroundColor: colors.surface, padding: 8 }]}>
          {subtasks.map((st, index) => (
            <View key={index} style={[styles.subtaskRow, { borderBottomColor: colors.border, borderBottomWidth: index === subtasks.length - 1 ? 0 : 1 }]}>
              <Text style={{ flex: 1, color: colors.text }}>{st.title}</Text>
              <TouchableOpacity onPress={() => handleDeleteSubtask(index)}>
                <Trash2 size={18} color={colors.subtext} />
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.addSubtaskRow}>
            <TextInput
              style={[styles.subtaskInput, { color: colors.text }]}
              placeholder="Yeni alt görev ekle..."
              placeholderTextColor={colors.subtext}
              value={newSubtaskTitle}
              onChangeText={setNewSubtaskTitle}
              onSubmitEditing={handleAddSubtask}
            />
            <TouchableOpacity onPress={handleAddSubtask}>
              <Plus size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notification Sound */}
        <Text style={[styles.sectionTitle, { color: colors.subtext }]}>Bildirim Sesi</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {['default', 'urgent', 'soft'].map((sound) => (
            <TouchableOpacity
              key={sound}
              style={[
                styles.chip,
                notificationSound === sound ? { backgroundColor: colors.primary } : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }
              ]}
              onPress={() => setNotificationSound(sound)}
            >
              <Text style={{ color: notificationSound === sound ? '#000' : colors.text }}>
                {sound === 'default' ? 'Varsayılan' : sound === 'urgent' ? 'Acil' : 'Hafif'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category */}
        <Text style={[styles.sectionTitle, { color: colors.subtext }]}>Kategori</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.chip,
                categoryId === cat.id ? { backgroundColor: cat.color } : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }
              ]}
              onPress={() => setCategoryId(cat.id)}
            >
              <Text style={{ color: categoryId === cat.id ? '#000' : colors.text }}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ height: 100 }} />
      </ScrollView>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  input: {
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  section: {
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  chipScroll: {
    flexDirection: 'row',
    marginBottom: 20, // Reduced from 40 for better spacing
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  addSubtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 8,
  },
  subtaskInput: {
    flex: 1,
    fontSize: 15,
    marginRight: 8,
  }
});
