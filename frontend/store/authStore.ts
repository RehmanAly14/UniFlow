import { create } from "zustand";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../utils/supabase";

interface User {
  id: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  fullName?: string;
  agNumber?: string;
  teacherId?: string;
  degree?: string;
  semester?: string;
  section?: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;

  // Used by login screen after signInWithPassword
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;

  // Legacy — kept for compatibility
  setAuth: (user: User, session: Session) => void;

  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true, // true until first Supabase check completes

  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),

  setAuth: (user, session) => set({ user, session, isLoading: false }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, isLoading: false });
  },
}));

// ─── Auto session hydration on app start ─────────────────────────────────────
// Resolves isLoading so app/index.tsx can redirect properly.
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    const meta = session.user?.user_metadata;
    useAuthStore.setState({
      session,
      isLoading: false,
      user: meta?.role
        ? {
            id: session.user.id,
            email: session.user.email ?? "",
            role: meta.role as User["role"],
            fullName: meta.fullName,
            agNumber: meta.agNumber,
            teacherId: meta.teacherId,
            degree: meta.degree,
            semester: String(meta.semester ?? ''),
            section: meta.section,
          }
        : null,
    });
  } else {
    useAuthStore.setState({ isLoading: false });
  }
});

// Keep session in sync when tokens refresh or user logs out from another tab
supabase.auth.onAuthStateChange((_event, session) => {
  if (session) {
    const meta = session.user?.user_metadata;
    useAuthStore.setState({
      session,
      isLoading: false,
      user: meta?.role
        ? {
            id: session.user.id,
            email: session.user.email ?? "",
            role: meta.role as User["role"],
            fullName: meta.fullName,
            agNumber: meta.agNumber,
            teacherId: meta.teacherId,
            degree: meta.degree,
            semester: String(meta.semester ?? ''),
            section: meta.section,
          }
        : null,
    });
  } else {
    useAuthStore.setState({ session: null, user: null, isLoading: false });
  }
});