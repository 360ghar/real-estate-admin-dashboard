import { ReactNode } from 'react'

interface DataListContainerProps {
  isLoading: boolean
  isError: boolean
  isEmpty: boolean
  loadingState?: ReactNode
  errorState?: ReactNode
  emptyState?: ReactNode
  children: ReactNode
}

export const DataListContainer = ({
  isLoading,
  isError,
  isEmpty,
  loadingState,
  errorState,
  emptyState,
  children,
}: DataListContainerProps) => {
  if (isLoading) return <>{loadingState}</>
  if (isError) return <>{errorState}</>
  if (isEmpty) return <>{emptyState}</>
  return <>{children}</>
}
