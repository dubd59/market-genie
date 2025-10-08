import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from '../security/SecureFirebase.js';
import { serverTimestamp } from 'firebase/firestore';

// Budget Control API
export async function getBudget(userId) {
  const ref = doc(db, 'budgets', userId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function setBudget(userId, dailyBudget, monthlyBudget) {
  const ref = doc(db, 'budgets', userId);
  await setDoc(ref, {
    userId,
    dailyBudget,
    monthlyBudget,
    currentDailySpend: 0,
    currentMonthlySpend: 0,
    lastResetDate: new Date().toISOString().split('T')[0],
    lastMonthlyReset: new Date().toISOString().substring(0, 7),
    updatedAt: serverTimestamp(),
  });
}

export async function updateBudgetSpend(userId, amount) {
  const ref = doc(db, 'budgets', userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data();
  let { currentDailySpend, currentMonthlySpend, lastResetDate, lastMonthlyReset } = data;
  const today = new Date().toISOString().split('T')[0];
  const month = new Date().toISOString().substring(0, 7);
  if (lastResetDate !== today) currentDailySpend = 0;
  if (lastMonthlyReset !== month) currentMonthlySpend = 0;
  currentDailySpend += amount;
  currentMonthlySpend += amount;
  await updateDoc(ref, {
    currentDailySpend,
    currentMonthlySpend,
    lastResetDate: today,
    lastMonthlyReset: month,
    updatedAt: serverTimestamp(),
  });
}

export async function canProceedWithOperation(userId, cost) {
  const budget = await getBudget(userId);
  if (!budget) return false;
  const today = new Date().toISOString().split('T')[0];
  const month = new Date().toISOString().substring(0, 7);
  let dailySpend = budget.lastResetDate === today ? budget.currentDailySpend : 0;
  let monthlySpend = budget.lastMonthlyReset === month ? budget.currentMonthlySpend : 0;
  return (dailySpend + cost <= budget.dailyBudget) && (monthlySpend + cost <= budget.monthlyBudget);
}
