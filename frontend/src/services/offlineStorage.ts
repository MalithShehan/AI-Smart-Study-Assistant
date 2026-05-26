import AsyncStorage from '@react-native-async-storage/async-storage';

// ══════════════════════════════════════════════════════════════════════════════
// OFFLINE STORAGE SERVICE
// ══════════════════════════════════════════════════════════════════════════════
// Simple wrapper around AsyncStorage for caching API data offline

const STORAGE_KEYS = {
  NOTES: '@notes',
  STUDY_PLAN: '@study_plan',
  TIMETABLE: '@timetable',
  GAMIFICATION: '@gamification',
  USER_PROFILE: '@user_profile',
  QUIZ_CACHE: '@quiz_cache',
  PAST_PAPERS: '@past_papers',
};

/**
 * Save data to offline storage
 */
export const saveOffline = async (key: string, data: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify({
      data,
      timestamp: Date.now(),
    });
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error('Failed to save offline data:', error);
  }
};

/**
 * Get data from offline storage
 * @param maxAge - Max age in milliseconds (default: 24 hours)
 */
export const getOffline = async <T = any>(
  key: string,
  maxAge: number = 24 * 60 * 60 * 1000
): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue === null) return null;

    const { data, timestamp } = JSON.parse(jsonValue);
    
    // Check if data is too old
    if (Date.now() - timestamp > maxAge) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    return data as T;
  } catch (error) {
    console.error('Failed to get offline data:', error);
    return null;
  }
};

/**
 * Remove data from offline storage
 */
export const removeOffline = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove offline data:', error);
  }
};

/**
 * Clear all offline data
 */
export const clearAllOffline = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Failed to clear offline data:', error);
  }
};

/**
 * Get all keys in storage
 */
export const getAllKeys = async (): Promise<string[]> => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('Failed to get all keys:', error);
    return [];
  }
};

/**
 * Get storage size (approximate)
 */
export const getStorageSize = async (): Promise<number> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    let totalSize = 0;

    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        totalSize += value.length;
      }
    }

    return totalSize; // in bytes
  } catch (error) {
    console.error('Failed to get storage size:', error);
    return 0;
  }
};

export { STORAGE_KEYS };
