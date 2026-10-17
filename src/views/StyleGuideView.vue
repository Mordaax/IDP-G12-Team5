<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { ArrowUpRight, ArrowRight, Bookmark, Check, ChevronRight, Heart, Info, LoaderCircle, MapPin, MessageCircle, Music2, Search, SlidersHorizontal, X, CalendarDays, Bell } from '@lucide/vue'
import { Button } from '@/components/guide-ui/button'
import { Input } from '@/components/guide-ui/input'
import { Textarea } from '@/components/guide-ui/textarea'
import { Label } from '@/components/guide-ui/label'
import { Checkbox } from '@/components/guide-ui/checkbox'
import { Switch } from '@/components/guide-ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/guide-ui/tabs'
import { Badge } from '@/components/guide-ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/guide-ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/guide-ui/alert'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/guide-ui/avatar'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/guide-ui/dialog'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/guide-ui/tooltip'
import { Skeleton } from '@/components/guide-ui/skeleton'
import db from '@/data/db.json'
import '@/style-guide/style-guide.css'

const sections = [
  { id:'overview', label:'Overview', group:'Start here' },
  { id:'brand', label:'Brand', group:'Foundations' },
  { id:'colours', label:'Colours' }, { id:'typography', label:'Typography' },
  { id:'layout', label:'Layout & spacing' }, { id:'shapes', label:'Shapes & elevation' }, { id:'imagery', label:'Icons & imagery' },
  { id:'buttons', label:'Buttons', group:'Components' }, { id:'forms', label:'Forms' },
  { id:'navigation', label:'Navigation' }, { id:'content', label:'Content & identity' }, { id:'feedback', label:'Feedback' },
  { id:'patterns', label:'Product patterns', group:'In context' },
]
const active = ref('overview')
const saved = ref(false)
const followed = ref(false)
const checked = ref(true)
const notifications = ref(false)
const preference = ref('electronic')
const reply = ref('')
const preview = ref('')
const replyError = ref('')
const email = ref('')
const emailError = ref('')
const emailStatus = ref('')
const toast = ref('')
const genre = ref('all')
const loading = ref(false)
let toastTimer, loadingTimer, observer
const palette = [
 { name:'Primary', token:'--lrm-primary', value:'#C2185B', usage:'Main action', white:true },
 { name:'Hover', token:'--lrm-hover', value:'#9D1249', usage:'Pointer hover', white:true },
 { name:'Selected', token:'--lrm-selected', value:'#7B0E39', usage:'Pressed / selected', white:true },
 { name:'Tint', token:'--lrm-tint', value:'#FBE3EE', usage:'Quiet selection', white:false },
]
const neutrals = [ ['Canvas','#F7F6F2','--sg-canvas'], ['Surface','#FFFFFF','--sg-surface'], ['Soft','#F1F0EC','--sg-soft'], ['Border','#DEDBD5','--sg-line'], ['Muted','#65605B','--sg-muted'], ['Ink','#272522','--sg-ink'] ]
const genres = db.events.genres
const event = db.events.events.find(e => e.id === 'fallingislands-battlebox') || db.events.events[0]
const artist = db.events.artists.find(a => a.id === event.headliner)
const venue = db.events.venues.find(v => v.id === event.venueId)
const visibleEvent = computed(() => genre.value === 'all' || genre.value === event.genreId)
function jump(id) { active.value=id; document.getElementById('sg-'+id)?.scrollIntoView({ behavior:'instant', block:'start' }) }
function notify(message) { toast.value=message; clearTimeout(toastTimer); toastTimer=setTimeout(() => toast.value='',5000) }
function previewReply() {
  replyError.value = reply.value.trim() ? '' : 'Write a reply before previewing.'
  preview.value = replyError.value ? '' : reply.value.trim()
}
function validateEmail() {
  emailError.value = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) ? '' : 'Enter a valid email address, for example kit@example.com.'
  emailStatus.value = emailError.value ? '' : 'Looks good. Demo only — no subscription was created.'
}
function simulateLoading() {
  loading.value=true
  loadingTimer=setTimeout(() => { loading.value=false; notify('Demo complete. Nothing was uploaded.') },1200)
}
onMounted(() => {
  observer=new IntersectionObserver(entries => {
    const visible=entries.filter(e => e.isIntersecting)
    if(visible.length) active.value=visible[0].target.id.replace('sg-','')
  }, { rootMargin:'-8% 0px -75% 0px' })
  sections.forEach(s => { const el=document.getElementById('sg-'+s.id); if(el) observer.observe(el) })
})
onBeforeUnmount(() => { observer?.disconnect(); clearTimeout(toastTimer); clearTimeout(loadingTimer) })
</script>

<template>
  <div class="style-guide">
    <div id="sg-portals"></div>
    <a class="sgu:sr-only sgu:focus:not-sr-only" href="#sg-main">Skip to guide content</a>
    <header class="sg-topbar">
      <a href="#sg-overview" class="sg-wordmark" aria-label="LittleRedMusic style guide" @click.prevent="jump('overview')">
        <img class="sg-mark" src="/assets/img/brand.png" alt="" />
        <span>Little<em>Red</em>Music</span>
      </a>
      <div class="sg-topmeta"><span>Design system / working draft</span><Badge variant="outline">v0.1 · Draft</Badge></div>
    </header>
    <div class="sg-mobile-nav"><label for="sg-section-select">On this page</label><select id="sg-section-select" class="sg-native" :value="active" @change="jump($event.target.value)"><option v-for="s in sections" :key="s.id" :value="s.id">{{ s.label }}</option></select></div>
    <div class="sg-shell">
      <aside class="sg-sidebar">
        <nav aria-label="Style guide sections">
          <template v-for="(s,i) in sections" :key="s.id">
            <span v-if="s.group" class="sg-nav-label">{{ s.group }}</span>
            <a :href="'#sg-'+s.id" :aria-current="active===s.id ? 'location' : undefined" @click.prevent="jump(s.id)"><span class="sg-nav-number">{{ String(i).padStart(2,'0') }}</span>{{ s.label }}</a>
          </template>
        </nav>
        <div class="sg-side-footer"><span class="sg-row"><span class="sg-genre-dot" style="background:#0f9d8a"></span>Built to evolve together</span><p class="sg-mt">A shared reference.<br>Not a finished rulebook.</p></div>
      </aside>
      <main id="sg-main" class="sg-main">
        <nav class="sg-breadcrumb" aria-label="Breadcrumb"><span>LittleRedMusic</span><ChevronRight aria-hidden="true"/><span>Design system</span><ChevronRight aria-hidden="true"/><span aria-current="page">Style guide</span></nav>
        <section id="sg-overview" class="sg-pagehead" aria-labelledby="sg-title">
          <span class="sg-eyebrow">Learn / compare / build</span>
          <h1 id="sg-title">Style guide</h1>
          <p class="sg-lead">A common language for a local music scene. Explore our foundations, try the components, and see how they come together in LittleRedMusic.</p>
          <div class="sg-row"><Badge>Working draft</Badge><span class="sg-small">Vue 3 · shadcn-vue · Tailwind CSS v4</span></div>
          <div class="sg-note"><strong>Team-led iteration.</strong> Humans lead research, critique, accessibility review and final decisions. LLM output is provisional, not user evidence. Editing and research guide: <code>docs/STYLE_GUIDE.md</code> (repository file).</div>
          <div class="sg-grid2 sg-mt">
            <div class="sg-panel sg-pad"><div class="sg-panel-title">Confirmed direction <Check aria-hidden="true" style="color:#1b6b48;margin-left:6px"/></div><p class="sg-small">Raspberry actions. Warm neutral surfaces. Space Grotesk headings, Inter everywhere else. Distinct genre colours. Existing screens stay unchanged.</p></div>
            <div class="sg-panel sg-pad"><div class="sg-panel-title">Proposed for team review <SlidersHorizontal aria-hidden="true" style="margin-left:6px"/></div><p class="sg-small">Spacing, type sizes, radii, shadows and patterns below are working defaults. Validate in context with users before adopting across the product.</p></div>
          </div>
        </section>

        <section id="sg-brand" class="sg-section">
          <div class="sg-sectionhead"><span class="sg-sectionindex">01</span><h2>Brand</h2><Badge variant="outline">Confirmed</Badge></div>
          <p class="sg-description">Recognisable, local, and never louder than the music.</p>
          <div class="sg-grid2">
            <div class="sg-panel"><div class="sg-logo-demo"><div class="sg-wordmark"><img src="/assets/img/brand.png" alt="Existing LittleRedMusic brand mark"/><span>Little<em>Red</em>Music</span></div></div><div class="sg-code"><code>Existing asset: /assets/img/brand.png</code></div></div>
            <div class="sg-panel sg-pad"><h3>Give the identity room</h3><ul class="sg-rules"><li>Use the existing mark; do not redraw, stretch or recolour the raster asset.</li><li>“Red” in the live wordmark is raspberry. Keep the rest in neutral ink.</li><li>Proposed clear space: one mark-width. Proposed minimum mark: 24 px.</li><li>Use a calm, high-contrast background. Avoid a busy photograph behind the logo.</li></ul></div>
          </div>
        </section>

        <section id="sg-colours" class="sg-section">
          <div class="sg-sectionhead"><span class="sg-sectionindex">02</span><h2>Colours</h2><Badge variant="outline">Brand confirmed</Badge></div>
          <p class="sg-description">Raspberry signals action, not every piece of information. Let warm neutrals do most of the work.</p>
          <div class="sg-swatch-grid"><div v-for="c in palette" :key="c.token" class="sg-swatch"><div class="sg-swatch-color" :style="{ background:c.value, color:c.white ? '#fff' : '#7B0E39' }">{{ c.value }}</div><div class="sg-swatch-caption"><strong>{{ c.name }}</strong><code>{{ c.token }}</code><span class="sg-small">{{ c.usage }}</span></div></div></div>
          <div class="sg-neutrals"><div v-for="(n,i) in neutrals" :key="n[0]" class="sg-neutral" :style="{background:n[1],color:i>3?'white':'#272522'}"><strong>{{ n[0] }}</strong><br>{{ n[1] }}<br><code>{{ n[2] }}</code></div></div>
          <p class="sg-small sg-mt">Neutral palette proposed. White text belongs on primary, hover and selected; dark selected text belongs on tint. Borders alone do not communicate state.</p>
          <div class="sg-panel sg-pad sg-mt"><div class="sg-panel-title">Functional colour is separate from genre</div><div class="sg-row"><Badge style="background:#e4f2e9;color:#185c3a">Success · #185C3A</Badge><Badge style="background:#fff0d3;color:#805800">Warning · #805800</Badge><Badge style="background:#fce7e5;color:#B42318">Error · #B42318</Badge><Badge style="background:#e8effc;color:#244a91">Information · #244A91</Badge></div><p class="sg-small sg-mt">Pair meaning with a label and icon. These semantic pairs are proposed, not interchangeable with genre dots.</p></div>
          <div class="sg-note">Genre colours remain distinct. Existing Discover and Events palettes differ; this lab uses <code>db.events.genres</code>. Harmonisation needs a team decision, not an automatic raspberry replacement.</div>
        </section>

        <section id="sg-typography" class="sg-section">
          <div class="sg-sectionhead"><span class="sg-sectionindex">03</span><h2>Typography</h2><Badge variant="outline">Fonts confirmed</Badge></div>
          <p class="sg-description">Space Grotesk gives headings a little character. Inter keeps reading, labels and controls familiar.</p>
          <div class="sg-panel">
            <div class="sg-type-row"><div class="sg-small">Heading 1<br><code>44 / 53 · 600</code></div><p class="sg-type-h1">Find your next sound.</p></div>
            <div class="sg-type-row"><div class="sg-small">Heading 2<br><code>27 / 32 · 600</code></div><h2 aria-hidden="true">Closer to the local scene</h2></div>
            <div class="sg-type-row"><div class="sg-small">Heading 3<br><code>18 / 22 · 600</code></div><h3 aria-hidden="true">Small rooms. Big discoveries.</h3></div>
            <div class="sg-type-row"><div class="sg-small">Body / Inter<br><code>14 / 23 · 400</code></div><p>Discover independent artists, find your people, and make room for something unexpected.</p></div>
            <div class="sg-type-row"><div class="sg-small">Label / Inter<br><code>12 / 18 · 500</code></div><span style="font-size:12px;font-weight:500">Electronic · Singapore</span></div>
            <div class="sg-code"><pre>h1, h2, h3 { font-family: 'Space Grotesk Variable', sans-serif; }
body, button, input { font-family: Inter, sans-serif; } // within .style-guide only</pre></div>
          </div>
          <p class="sg-small sg-mt">Scale proposed. H1 reduces to 36 px on small screens. Keep paragraphs around 60–75 characters; use sentence case, not all-caps controls. Fonts are self-hosted.</p>
        </section>

        <section id="sg-layout" class="sg-section">
          <div class="sg-sectionhead"><span class="sg-sectionindex">04</span><h2>Layout &amp; spacing</h2><Badge variant="outline">Proposed</Badge></div>
          <p class="sg-description">A 4 px base, consistent rhythm, and enough breathing room to compare examples.</p>
          <div class="sg-panel sg-pad"><div class="sg-space"><div v-for="space in [4,8,12,16,24,32,48,64]" :key="space" class="sg-space-item"><div class="sg-space-bar" :style="{height:space+'px'}"></div><code>{{ space }} px</code></div></div></div>
          <div class="sg-panel sg-pad sg-mt"><div class="sg-row sg-between"><strong class="sg-panel-title" style="margin:0">12-column reference</strong><span class="sg-small">24 px product gutter · 16–24 px card gap</span></div><div class="sg-layout-grid" aria-hidden="true"><span v-for="n in 12" :key="n"></span></div><p class="sg-small">Product grids: 12 columns desktop, 8 tablet, 4 mobile. This guide: 224 px rail and a flexible reading area; below 700 px use the compact section menu. Card grids collapse to one column.</p></div>
        </section>

        <section id="sg-shapes" class="sg-section">
          <div class="sg-sectionhead"><span class="sg-sectionindex">05</span><h2>Shapes &amp; elevation</h2><Badge variant="outline">Proposed</Badge></div>
          <p class="sg-description">Rounded rectangles for the interface. Circles for people and genre dots. Elevation only when something lifts above the page.</p>
          <div class="sg-grid3"><div class="sg-panel sg-pad"><div class="sg-shape" style="border-radius:7px"></div><strong>Controls · 7–8 px</strong><p class="sg-small">Buttons, inputs, filters.</p></div><div class="sg-panel sg-pad"><div class="sg-shape" style="border-radius:12px;box-shadow:0 1px 2px #2725220a"></div><strong>Cards · 12 px</strong><p class="sg-small">1 px warm border, quiet shadow.</p></div><div class="sg-panel sg-pad"><div class="sg-shape" style="border-radius:12px;box-shadow:0 8px 24px #27252220"></div><strong>Overlays · 12 px</strong><p class="sg-small">Lift dialogs, not every container.</p></div></div>
        </section>

        <section id="sg-imagery" class="sg-section">
          <div class="sg-sectionhead"><span class="sg-sectionindex">06</span><h2>Icons &amp; imagery</h2><Badge variant="outline">Proposed</Badge></div>
          <p class="sg-description">Simple line icons support the words. Artist imagery brings the personality.</p>
          <div class="sg-grid2"><div class="sg-panel sg-pad"><h3>One consistent icon family</h3><div class="sg-icon-demo"><Search/><Heart/><Bookmark/><MapPin/><CalendarDays/><MessageCircle/><Music2/></div><p class="sg-small">Lucide: 16–24 px, 1.75–2 px stroke. Pair icons with text; give icon-only buttons an accessible name. Keep a 40–44 px touch target.</p></div><div class="sg-panel sg-pad"><div class="sg-row"><img class="sg-artist-cover" src="/assets/img/fallingislands-avatar.jpg" alt="FallingIslands artist artwork"/><div><h3>Crop with intent</h3><p class="sg-small">Artist / avatar 1:1<br>Event cover 16:9 · editorial 4:3</p></div></div><p class="sg-small sg-mt">Use <code>object-fit: cover</code>, preserve the subject, and write meaningful alt text. Decorative art gets empty alt text. Never turn an unavailable image into invented photography.</p></div></div>
        </section>

        <section id="sg-buttons" class="sg-section">
          <div class="sg-sectionhead"><span class="sg-sectionindex">07</span><h2>Buttons</h2></div>
          <p class="sg-description">One clear primary action per area. These are real shadcn-vue buttons; demo actions only update this page.</p>
          <div class="sg-panel"><div class="sg-pad"><div class="sg-button-grid"><div class="sg-state"><Button class="sg-primary" @click="notify('Primary action previewed. No navigation or data change.')">Explore music <ArrowRight/></Button><span>Primary</span></div><div class="sg-state"><Button variant="outline" @click="notify('Secondary action previewed.')">View artist</Button><span>Outline</span></div><div class="sg-state"><Button variant="secondary" @click="notify('Secondary action previewed.')">More options</Button><span>Secondary</span></div><div class="sg-state"><Button variant="ghost" @click="notify('Ghost action previewed.')">Not now</Button><span>Ghost</span></div><div class="sg-state"><Button variant="link" @click="jump('patterns')">See patterns <ArrowUpRight/></Button><span>Link</span></div><div class="sg-state"><Button variant="destructive" @click="notify('Destructive appearance only. Nothing was deleted.')">Remove demo</Button><span>Destructive</span></div></div></div><div class="sg-code"><code>&lt;Button class="sg-primary" @click="localAction"&gt;Explore music&lt;/Button&gt;</code></div></div>
          <div class="sg-panel sg-pad sg-mt"><div class="sg-panel-title">Interaction states · fixed specimens + live controls</div><div class="sg-button-grid"><div class="sg-state"><Button class="sg-primary" @click="notify('Resting button activated.')">Resting</Button><span>#C2185B</span></div><div class="sg-state"><Button class="sg-hover" @click="notify('Hover specimen activated.')">Hover</Button><span>#9D1249 · specimen</span></div><div class="sg-state"><Button class="sg-pressed" @click="notify('Pressed specimen activated.')">Pressed</Button><span>#7B0E39 · specimen</span></div><div class="sg-state"><Button class="sg-primary sg-focus" @click="notify('Focus specimen activated.')">Focus</Button><span>3 px ring · specimen</span></div><div class="sg-state"><Button class="sg-primary" disabled>Unavailable</Button><span>Disabled</span></div><div class="sg-state"><Button class="sg-primary" :disabled="loading" :aria-busy="loading" @click="simulateLoading"><LoaderCircle v-if="loading" class="sgu:animate-spin"/>{{ loading ? 'Working…' : 'Try loading' }}</Button><span>Live · 1.2 s simulation</span></div><div class="sg-state"><Button variant="outline" :aria-pressed="followed" @click="followed=!followed"><Check v-if="followed"/>{{ followed ? 'Following' : 'Follow artist' }}</Button><span>Live selected state</span></div></div></div>
        </section>

        <section id="sg-forms" class="sg-section">
          <div class="sg-sectionhead"><span class="sg-sectionindex">08</span><h2>Forms</h2></div>
          <p class="sg-description">Labels stay visible. Explain errors beside the field. Never rely on colour or placeholders alone.</p>
          <div class="sg-grid2"><form class="sg-panel sg-pad sg-stack" novalidate @submit.prevent="validateEmail"><div class="sg-field"><Label for="sg-email">Email address</Label><Input id="sg-email" v-model="email" type="email" placeholder="kit@example.com" :aria-invalid="!!emailError" aria-describedby="sg-email-help sg-email-error"/><p id="sg-email-help" class="sg-small">A validation demo, not a mailing list.</p><p v-if="emailError" id="sg-email-error" role="alert" class="sg-error">{{ emailError }}</p></div><div class="sg-field"><Label for="sg-genre">Favourite genre</Label><select id="sg-genre" v-model="preference" class="sg-native"><option v-for="g in genres" :key="g.id" :value="g.id">{{ g.label }}</option></select></div><Button type="submit" class="sg-primary" style="justify-self:start">Validate example</Button><p v-if="emailStatus" role="status" class="sg-small">{{ emailStatus }}</p></form>
          <div class="sg-panel sg-pad sg-stack"><div class="sg-choice"><Checkbox id="sg-updates" v-model="checked"/><Label for="sg-updates">Include nearby events</Label></div><div class="sg-choice"><Switch id="sg-notifications" v-model="notifications" :aria-label="`Demo notifications ${notifications ? 'on' : 'off'}`"/><Label for="sg-notifications">Demo notifications {{ notifications ? 'on' : 'off' }}</Label></div><fieldset><legend>Discovery preference</legend><div class="sg-stack"><label class="sg-choice"><input type="radio" name="sg-discovery" value="familiar" checked/>More familiar sounds</label><label class="sg-choice"><input type="radio" name="sg-discovery" value="new"/>Something new</label></div></fieldset><div class="sg-field"><Label for="sg-disabled">Disabled field</Label><Input id="sg-disabled" disabled model-value="Read-only demo state"/></div><p class="sg-small">Checkbox and switch use shadcn-vue / Reka UI. Select and radio are native controls. Preferences are in-memory only.</p></div></div>
          <div class="sg-panel sg-mt"><div class="sg-code"><pre>&lt;Label for="email"&gt;Email address&lt;/Label&gt;
&lt;Input id="email" v-model="email" :aria-invalid="!!error" aria-describedby="email-error" /&gt;
&lt;p v-if="error" id="email-error" role="alert"&gt;{{ 'Enter a valid email address.' }}&lt;/p&gt;</pre></div></div>
        </section>

        <section id="sg-navigation" class="sg-section">
          <div class="sg-sectionhead"><span class="sg-sectionindex">09</span><h2>Navigation</h2></div>
          <p class="sg-description">Tabs switch related content in place. Breadcrumbs explain location. Selected states use tint, not another loud primary button.</p>
          <div class="sg-panel sg-pad"><nav aria-label="Example breadcrumb" class="sg-breadcrumb" style="margin-bottom:20px"><a href="#sg-patterns" class="sg-textlink" @click.prevent="jump('patterns')">Discover</a><ChevronRight aria-hidden="true"/><span aria-current="page">FallingIslands</span></nav><Tabs default-value="about"><TabsList aria-label="Artist demo tabs"><TabsTrigger value="about">About</TabsTrigger><TabsTrigger value="events">Events</TabsTrigger><TabsTrigger value="discussion">Discussion</TabsTrigger></TabsList><TabsContent value="about" class="sg-mt"><h3>Meet FallingIslands</h3><p class="sg-small sg-mt">Electronic sounds from Singapore. A tab preview using the existing prototype artist.</p></TabsContent><TabsContent value="events" class="sg-mt"><h3>Live at the BattleBox</h3><p class="sg-small sg-mt">Example event from the prototype dataset, not a live listing.</p></TabsContent><TabsContent value="discussion" class="sg-mt"><h3>Make room for conversation</h3><p class="sg-small sg-mt">Use the local reply preview in Product patterns below.</p></TabsContent></Tabs></div>
        </section>

        <section id="sg-content" class="sg-section">
          <div class="sg-sectionhead"><span class="sg-sectionindex">10</span><h2>Content &amp; identity</h2></div>
          <p class="sg-description">Cards group one idea. Badges describe a status, not an action. Avatars have an honest fallback.</p>
          <div class="sg-grid2"><Card><CardHeader><div class="sg-row sg-between"><Badge variant="secondary">Artist</Badge><Badge variant="outline">Singapore</Badge></div><CardTitle>People before profiles</CardTitle><CardDescription>Let the artist name and their work lead.</CardDescription></CardHeader><CardContent><div class="sg-row"><Avatar><AvatarImage src="/assets/img/fallingislands-avatar.jpg" alt="FallingIslands"/><AvatarFallback>FI</AvatarFallback></Avatar><div><strong>FallingIslands</strong><p class="sg-small">Electronic · prototype content</p></div></div></CardContent><CardFooter><Button variant="outline" @click="notify('Artist card preview. No external navigation.')">Preview artist <ArrowUpRight/></Button></CardFooter></Card><div class="sg-panel sg-pad"><h3>Quiet, useful metadata</h3><div class="sg-row sg-mt"><Badge>Featured example</Badge><Badge variant="secondary">Local artist</Badge><Badge variant="outline">Draft</Badge></div><div class="sg-row sg-mt"><Avatar><AvatarFallback>KT</AvatarFallback></Avatar><div><strong>Kit Tan</strong><p class="sg-small">Initials fallback · no photo available</p></div></div><p class="sg-small sg-mt">Use short, sentence-case labels. Do not invent verification, popularity scores or performance claims.</p></div></div>
        </section>

        <section id="sg-feedback" class="sg-section">
          <div class="sg-sectionhead"><span class="sg-sectionindex">11</span><h2>Feedback</h2></div>
          <p class="sg-description">Say what happened, what it means, and what someone can do next.</p>
          <Alert><Info aria-hidden="true"/><AlertTitle>This is a safe place to try things</AlertTitle><AlertDescription>All interactions on this page are local demos. No account, event or forum data is changed.</AlertDescription></Alert>
          <div class="sg-grid2 sg-mt"><div class="sg-panel sg-pad sg-stack"><h3>Context without interruption</h3><div class="sg-row"><Button variant="outline" @click="notify('Preview saved in this session only.')">Show demo toast</Button><TooltipProvider :delay-duration="150"><Tooltip><TooltipTrigger as-child><Button variant="outline" aria-label="Local only — about demo data"><Info/>Local only</Button></TooltipTrigger><TooltipContent>Nothing here writes to your account.</TooltipContent></Tooltip></TooltipProvider></div><Dialog><DialogTrigger as-child><Button class="sg-primary" style="justify-self:start">Open demo dialog</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>A moment to confirm</DialogTitle><DialogDescription>This dialog is a component preview. Escape or Close returns focus to the trigger; no changes will be made.</DialogDescription></DialogHeader><DialogFooter><DialogClose as-child><Button class="sg-primary">Close preview</Button></DialogClose></DialogFooter></DialogContent></Dialog><p class="sg-small">Dialog and tooltip portal into <code>#sg-portals</code>, inside this guide. The toast is a local live-region pattern.</p></div>
          <div class="sg-panel sg-pad"><h3>Loading, not missing</h3><div class="sg-row sg-mt" role="img" aria-label="Loading artist card skeleton"><Skeleton class="sgu:size-12 sgu:rounded-full"/><div class="sg-stack" style="flex:1"><Skeleton class="sgu:h-4 sgu:w-3/4"/><Skeleton class="sgu:h-3 sgu:w-1/2"/></div></div><p class="sg-small sg-mt">Skeleton is a static loading specimen, not an actual network request. Respect reduced-motion settings.</p></div></div>
          <div class="sg-panel sg-empty sg-mt"><Bookmark aria-hidden="true"/><h3>A little quiet here</h3><p class="sg-small">No saved events in this empty-state example.<br>Start with a sound that catches your ear.</p><Button variant="outline" @click="jump('patterns')">Explore the event example <ArrowRight/></Button></div>
        </section>

        <section id="sg-patterns" class="sg-section">
          <div class="sg-sectionhead"><span class="sg-sectionindex">12</span><h2>Product patterns</h2><Badge variant="outline">Proposed</Badge></div>
          <p class="sg-description">Foundations in context: discover an artist, narrow a genre, save an event, and join a conversation. Existing prototype data, not live availability.</p>
          <div class="sg-panel sg-pad"><div class="sg-panel-title">Genre filters · multi-colour, never brand-coloured data</div><div class="sg-row"><button class="sg-filter" :aria-pressed="genre==='all'" @click="genre='all'">All genres</button><button v-for="g in genres" :key="g.id" class="sg-filter" :aria-pressed="genre===g.id" @click="genre=g.id"><span class="sg-genre-dot" :style="{background:g.hex}"></span>{{ g.label }}</button></div><p class="sg-small sg-mt" role="status">{{ visibleEvent ? '1 prototype event matches.' : 'No prototype events match this filter.' }}</p></div>
          <div class="sg-grid2 sg-mt"><Card v-if="visibleEvent" style="padding-top:0;overflow:hidden"><img class="sg-event-cover" :src="db.images.eventHero" alt=""/><CardHeader><div class="sg-row"><span class="sg-genre-dot" :style="{background:genres.find(g=>g.id===event.genreId)?.hex}"></span><span class="sg-small">{{ genres.find(g=>g.id===event.genreId)?.label }} · Event example</span></div><CardTitle>{{ event.name || artist?.name }}</CardTitle><CardDescription>{{ artist?.name }} · {{ venue?.name || 'BattleBox' }}</CardDescription></CardHeader><CardContent><p class="sg-small">{{ event.about }}</p><p class="sg-small sg-mt">{{ event.time }} · {{ event.free ? 'Free entry' : 'S$'+event.price }} · Prototype schedule</p><p class="sg-small">Cover uses the existing placeholder artwork, not a venue photograph.</p></CardContent><CardFooter><Button class="sg-primary" :aria-pressed="saved" @click="saved=!saved"><Bookmark :fill="saved ? 'currentColor' : 'none'"/>{{ saved ? 'Event saved' : 'Save event' }}</Button><span class="sg-small" style="margin-left:12px">This page only</span></CardFooter></Card><div v-else class="sg-panel sg-empty"><Search aria-hidden="true"/><h3>No matching event example</h3><p class="sg-small">Try All genres to see the event card.</p><Button variant="outline" @click="genre='all'">Clear genre filter</Button></div>
          <div class="sg-stack"><div class="sg-panel sg-pad"><div class="sg-row"><img class="sg-artist-cover" src="/assets/img/fallingislands-avatar.jpg" alt="FallingIslands artwork"/><div><h3>FallingIslands</h3><p class="sg-small">Electronic · Singapore</p></div></div><p class="sg-small sg-mt">An artist card balances identity, genre, and a clear next step.</p><Button variant="outline" class="sg-mt" :aria-pressed="followed" @click="followed=!followed"><Heart :fill="followed ? 'currentColor' : 'none'"/>{{ followed ? 'Following artist' : 'Follow this artist' }}</Button></div>
          <div class="sg-panel sg-pad"><h3>Taste, with a legend</h3><p class="sg-small sg-mt">Illustrative equal segments, not your listening history or a recommendation score.</p><div class="sg-taste" aria-hidden="true"><span v-for="g in genres" :key="g.id" :style="{background:g.hex,flex:1}"></span></div><div class="sg-legend"><span v-for="g in genres" :key="g.id" class="sg-row" style="gap:7px"><span class="sg-genre-dot" :style="{background:g.hex}"></span>{{ g.label }}</span></div></div></div></div>
          <form class="sg-panel sg-pad sg-stack sg-mt" @submit.prevent="previewReply"><div class="sg-row"><Avatar><AvatarFallback>KT</AvatarFallback></Avatar><div><h3>Make space for a reply</h3><p class="sg-small">Kit Tan · local preview only</p></div></div><div class="sg-field"><Label for="sg-reply">Reply</Label><Textarea id="sg-reply" v-model="reply" placeholder="What are you looking forward to?" :aria-invalid="!!replyError" aria-describedby="sg-reply-help sg-reply-error" maxlength="500"/><p id="sg-reply-help" class="sg-small">Be kind, stay on topic. {{ reply.length }}/500 characters. Nothing is posted.</p><p v-if="replyError" id="sg-reply-error" role="alert" class="sg-error">{{ replyError }}</p></div><div class="sg-row"><Button class="sg-primary" type="submit">Preview reply <ArrowRight/></Button><Button type="button" variant="ghost" @click="reply='';preview='';replyError=''">Clear</Button></div><div v-if="preview" role="status" class="sg-note" style="margin-top:0"><strong>Reply preview — not posted</strong><p style="white-space:pre-wrap;overflow-wrap:anywhere">{{ preview }}</p></div></form>
          <div class="sg-panel sg-mt"><div class="sg-code"><pre>// Local state, never a write to the existing saved-events store.
const saved = ref(false)
&lt;Button :aria-pressed="saved" @click="saved = !saved"&gt;
  {{ 'Save event / Event saved' }}
&lt;/Button&gt;</pre></div></div>
        </section>
        <footer class="sg-footer sg-row sg-between"><span>LittleRedMusic · A shared language, still in progress.</span><a class="sg-textlink" href="#sg-overview" @click.prevent="jump('overview')">Back to overview ↑</a></footer>
      </main>
    </div>
    <div v-if="toast" class="sg-toast" role="status"><span><Check aria-hidden="true"/> {{ toast }}</span><button aria-label="Dismiss notification" @click="toast=''"><X/></button></div>
  </div>
</template>
