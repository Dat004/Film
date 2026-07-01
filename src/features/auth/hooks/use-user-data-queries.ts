import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ref, onValue, get } from "firebase/database";
import { database } from "@/lib/firebase";
import { ContinueWatchingItem, WatchListItem, WatchListGroup } from "@/types";

export function useContinueWatching(uid: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ["user", "continue_watching", uid];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<ContinueWatchingItem[]> => {
      if (!uid) return [];
      const dbRef = ref(database, `continue_watching/${uid}`);
      const snapshot = await get(dbRef);
      if (!snapshot.exists()) return [];
      const val = snapshot.val();
      return Object.keys(val).map((key) => val[key]);
    },
    enabled: !!uid,
    staleTime: Infinity, // Rely on real-time onValue synchronization
  });

  React.useEffect(() => {
    if (!uid) return;
    const dbRef = ref(database, `continue_watching/${uid}`);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) {
        queryClient.setQueryData(queryKey, []);
      } else {
        const list = Object.keys(val).map((key) => val[key]);
        queryClient.setQueryData(queryKey, list);
      }
    });

    return () => unsubscribe();
  }, [uid, queryClient, queryKey]);

  return query;
}

export function useWatchList(uid: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ["user", "watchlist", uid];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<WatchListGroup[]> => {
      if (!uid) return [];
      const dbRef = ref(database, `list_video/${uid}`);
      const snapshot = await get(dbRef);
      if (!snapshot.exists()) return [];
      const val = snapshot.val();
      return formatWatchList(val);
    },
    enabled: !!uid,
    staleTime: Infinity,
  });

  React.useEffect(() => {
    if (!uid) return;
    const dbRef = ref(database, `list_video/${uid}`);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) {
        queryClient.setQueryData(queryKey, []);
      } else {
        queryClient.setQueryData(queryKey, formatWatchList(val));
      }
    });

    return () => unsubscribe();
  }, [uid, queryClient, queryKey]);

  return query;
}

// Helpers mapping database layout format
function formatWatchList(val: Record<string, any>): WatchListGroup[] {
  const watchListData: Record<string, WatchListItem[]> = {};
  const dataList = Object.keys(val).map((key) => val[key]);

  for (let i = 0; i < dataList.length; i++) {
    const type = dataList[i].type || "phim-khac";
    if (!watchListData[type]) {
      watchListData[type] = [];
    }
    watchListData[type].push(dataList[i]);
  }

  const watchListArr: WatchListGroup[] = [];
  for (const key in watchListData) {
    watchListArr.push({
      title: key,
      data: watchListData[key],
    });
  }

  return watchListArr;
}
