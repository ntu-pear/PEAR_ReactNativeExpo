import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'pear:favorites:v1';

// Safely get a patient ID
export function getPatientId(p) {
  return (
    p?.id ??
    p?.patientId ??
    p?.PatientId ??
    p?._id ??
    String(p?.nric ?? p?.email ?? '')
  );
}

export async function getAll() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function setAll(list) {
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

export async function toggle(id) {
  const set = new Set(await getAll());
  set.has(id) ? set.delete(id) : set.add(id);
  const arr = Array.from(set);
  await setAll(arr);
  return arr;
}
