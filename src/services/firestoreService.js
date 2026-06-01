import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

const toRecord = (snapshot) => ({
  id: snapshot.id,
  ...snapshot.data(),
});

export const getUsers = async () => {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map(toRecord);
};

export const getUserByEmail = async (email) => {
  const usersQuery = query(collection(db, "users"), where("email", "==", email));
  const snapshot = await getDocs(usersQuery);
  return snapshot.empty ? null : toRecord(snapshot.docs[0]);
};

export const createUser = async (user) => {
  const now = new Date().toISOString();
  const userRef = await addDoc(collection(db, "users"), {
    ...user,
    role: user.role || "operator",
    createdAt: now,
    updatedAt: now,
  });
  return { id: userRef.id, ...user };
};

export const getProblems = async () => {
  const problemsQuery = query(collection(db, "problems"), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(problemsQuery);
  return snapshot.docs.map(toRecord);
};

export const createProblem = async (problem) => {
  const problemRef = await addDoc(collection(db, "problems"), problem);
  return { id: problemRef.id, ...problem };
};

export const updateProblem = async (problemId, problem) => {
  await setDoc(doc(db, "problems", String(problemId)), problem, { merge: true });
};

export const deleteProblem = async (problemId) => {
  await deleteDoc(doc(db, "problems", String(problemId)));
};

export const getProblemHistory = async () => {
  const historyQuery = query(collection(db, "problemHistory"), orderBy("historyTimestamp", "desc"));
  const snapshot = await getDocs(historyQuery);
  return snapshot.docs.map(toRecord);
};

export const createHistoryEntry = async (entry) => {
  const historyRef = await addDoc(collection(db, "problemHistory"), entry);
  return { id: historyRef.id, ...entry };
};
