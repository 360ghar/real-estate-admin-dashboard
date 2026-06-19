/**
 * The legacy page-number `<Pagination>` component has been removed in favour of
 * cursor-based pagination. List pages now use `<CursorPager>` (driven by
 * `has_more` + a client-side cursor history stack) from `@/components/ui/cursor-pager`.
 *
 * This module re-exports `CursorPager` as the default so any remaining default
 * import resolves to the new component. New code should import `CursorPager`
 * directly.
 */
export { CursorPager as default, CursorPager } from '@/components/ui/cursor-pager'
