import { useQuery } from '@tanstack/react-query';

// Flexible request signature that covers both api-client style (path, options)
// and service layer style (arg1, arg2?) with varying argument types.
export type FetchRequest<TResponse = unknown> = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arg1: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arg2?: any
) => Promise<TResponse>;

export interface UseFetchDataParams<TResponse, TData> {
  request: FetchRequest<TResponse>;
  path?: unknown;
  options?: Record<string, unknown>;
  dependencies?: unknown[];
  condition?: boolean;
}

const useFetchData = <TResponse = unknown, TData = unknown>({
  request,
  path = '',
  options = {},
  dependencies = [],
  condition = true,
}: UseFetchDataParams<TResponse, TData>) => {
  const { data, isLoading, isError, isSuccess, error } = useQuery<TData, Error>({
    queryKey: [request.name, path, options, ...dependencies],
    queryFn: async (): Promise<TData> => {
      const response = await request(path, options);

      if (response instanceof Error) {
        throw response;
      }

      if (Array.isArray(response)) {
        return response as unknown as TData;
      }

      const resObj = response as { data?: { data?: unknown } } | null;
      if (resObj && resObj.data) {
        return (resObj.data.data || resObj.data) as TData;
      }

      return response as unknown as TData;
    },
    enabled: condition,
  });

  return {
    state: {
      isFetching: isLoading,
      isError,
      isSuccess,
      error,
    },
    newData: data ?? null,
  };
};

export default useFetchData;
