import Link from '@/components/AppLink'
import { FORUM_CATEGORIES } from './forumModel'

export default function ForumSidebar({ active }) {
  return <aside className="w-[184px] shrink-0 max-[780px]:w-full">
    <p className="m-0 text-[11px] leading-[16px] font-semibold text-muted">COMMUNITY</p>
    <nav aria-label="Forum categories" className="mt-[16px] flex flex-col gap-[8px] max-[780px]:flex-row max-[780px]:flex-wrap">
      {FORUM_CATEGORIES.map(category => <Link key={category.id} to={category.path} aria-current={active === category.id ? 'page' : undefined} className={`inline-flex min-h-[32px] items-center rounded-[20px] px-[9px] text-[14px] ${active === category.id ? 'border border-accent bg-accent-tint text-accent' : 'text-ink hover:bg-soft'}`}>{category.label}</Link>)}
    </nav>
    <div className="mt-[16px] rounded-[12px] bg-soft p-[16px] max-[780px]:hidden">
      <p className="m-0 text-[11px] leading-[16px] font-semibold text-muted">BATTLEBOX 2026</p>
      <p className="m-0 mt-[8px] text-[18px] leading-[26px] font-semibold text-ink">From the stage<br/>to the thread.</p>
      <p className="m-0 mt-[8px] text-[12px] leading-[17px] text-muted">Talk music. Meet the scene.</p>
    </div>
  </aside>
}
