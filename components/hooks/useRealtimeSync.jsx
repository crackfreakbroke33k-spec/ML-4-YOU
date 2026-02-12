import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * Real-time sync hook for Admin/Super Admin users
 * Provides instant data visibility with zero-delay propagation
 */
export function useRealtimeSync() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isElevated, setIsElevated] = useState(false);

  useEffect(() => {
    const initUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        const elevated = currentUser?.is_admin || 
                        currentUser?.is_super_admin || 
                        currentUser?.role === 'admin' ||
                        currentUser?.email === 'durjoychatterjee59@gmail.com' ||
                        currentUser?.email === 'dasriyanka858@gmail.com';
        
        setIsElevated(elevated);

        // Immediate full data fetch for newly elevated users
        if (elevated) {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['users'] }),
            queryClient.invalidateQueries({ queryKey: ['activitylogs'] }),
            queryClient.invalidateQueries({ queryKey: ['mlanalyses'] }),
            queryClient.invalidateQueries({ queryKey: ['datasets'] }),
            queryClient.invalidateQueries({ queryKey: ['savedmodels'] }),
            queryClient.invalidateQueries({ queryKey: ['trainingjobs'] }),
          ]);
        }
      } catch (error) {
        console.error("User init error:", error);
      }
    };

    initUser();
  }, [queryClient]);

  // Aggressive real-time polling for elevated users (1 second interval)
  useEffect(() => {
    if (!isElevated) return;

    const syncInterval = setInterval(async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.invalidateQueries({ queryKey: ['activitylogs'] }),
        queryClient.invalidateQueries({ queryKey: ['mlanalyses'] }),
        queryClient.invalidateQueries({ queryKey: ['datasets'] }),
        queryClient.invalidateQueries({ queryKey: ['savedmodels'] }),
      ]);
    }, 1000); // 1 second real-time sync

    return () => clearInterval(syncInterval);
  }, [isElevated, queryClient]);

  return { user, isElevated };
}

/**
 * Broadcast change to all elevated users instantly
 */
export async function broadcastChange(queryClient, queryKeys = []) {
  if (!Array.isArray(queryKeys)) queryKeys = [queryKeys];
  
  await Promise.all(
    queryKeys.map(key => 
      queryClient.invalidateQueries({ 
        queryKey: Array.isArray(key) ? key : [key],
        refetchType: 'all'
      })
    )
  );
}