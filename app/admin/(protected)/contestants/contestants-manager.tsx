"use client";

import { useState } from "react";
import Link from "next/link";
import { saveContestant, createCompetition, toggleContestant } from "./actions";

type Competition = { id: string; name: string; slug: string; status: string };
type Contestant = {
  id: string; competition_id: string; contestant_number: string | null;
  full_name: string; stage_name: string | null; biography: string | null;
  photo_path: string | null; is_active: boolean; display_order: number;
  photo_url: string | null;
};

export default function ContestantsManager({ competitions, contestants, error, saved }: {
  competitions: Competition[]; contestants: Contestant[]; error?: string; saved?: string;
}) {
  const [editing, setEditing] = useState<Contestant | null>(null);
  const [showCompetition, setShowCompetition] = useState(competitions.length === 0);
  const [showForm, setShowForm] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(competitions[0]?.id ?? "");

  return (
    <main className="page-shell min-h-screen">
      <header className="border-b border-white/10 bg-[#100d16]/90">
        <div className="site-container flex min-h-[76px] items-center justify-between gap-4">
          <Link href="/admin" className="font-serif text-lg tracking-[.12em] text-[#f5e9d0]">PAGENTARY <span className="font-sans text-[9px] text-[#b9a47b]">ADMIN</span></Link>
          <Link href="/admin" className="text-xs text-[#c9c0ce] hover:text-white">Back to dashboard</Link>
        </div>
      </header>
      <div className="site-container py-10">
        <p className="eyebrow">Competition management</p>
        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><h1 className="font-serif text-4xl text-[#f8f1e7]">Contestants</h1><p className="mt-2 text-sm text-[#b9aebe]">Create and maintain contestant profiles and official portraits.</p></div>
          <button onClick={() => { setEditing(null); setShowForm(true); }} disabled={!competitions.length} className="gold-button disabled:opacity-40">Add contestant</button>
        </div>

        {error && <p role="alert" className="mt-6 rounded border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{error === "photo" ? "Use a JPG, PNG or WebP image up to 5 MB." : error === "upload" ? "The photo could not be uploaded. Check the Storage bucket and try again." : error === "competition" ? "Enter a competition name and a valid URL slug." : "We could not save those details. Check required fields and contestant number uniqueness."}</p>}
        {saved && <p className="mt-6 rounded border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">Changes saved successfully.</p>}

        {!competitions.length ? (
          <section className="mt-8 rounded-xl border border-[#d8b56d]/25 bg-[#191421] p-7">
            <h2 className="font-serif text-2xl text-[#f5e9d0]">Create your first competition</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#b9aebe]">Contestants belong to a competition. Create a draft competition first; it will remain unpublished until you configure and open it.</p>
            <form action={createCompetition} className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-xs text-[#e7dcc8]">Competition name<input name="name" required minLength={2} placeholder="e.g. Miss Evergreen 2027" className="mt-2 h-11 w-full rounded border border-white/10 bg-[#100d16] px-3 text-sm text-white" /></label>
              <label className="text-xs text-[#e7dcc8]">URL slug<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="miss-evergreen-2027" className="mt-2 h-11 w-full rounded border border-white/10 bg-[#100d16] px-3 text-sm text-white" /></label>
              <label className="text-xs text-[#e7dcc8] sm:col-span-2">Description (optional)<textarea name="description" rows={3} className="mt-2 w-full rounded border border-white/10 bg-[#100d16] p-3 text-sm text-white" /></label>
              <button className="gold-button sm:col-span-2">Create draft competition</button>
            </form>
          </section>
        ) : (
          <>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <label className="text-xs text-[#b9aebe]">Filter competition</label>
              <select value={selectedCompetition} onChange={e => setSelectedCompetition(e.target.value)} className="h-10 rounded border border-white/10 bg-[#191421] px-3 text-sm text-white">
                {competitions.map(c => <option key={c.id} value={c.id}>{c.name} · {c.status}</option>)}
              </select>
              <button onClick={() => setShowCompetition(v => !v)} className="text-xs text-[#e1c27e] underline">Add another competition</button>
            </div>
            {showCompetition && <form action={createCompetition} className="mt-4 grid gap-3 rounded-lg border border-white/10 bg-[#191421] p-5 sm:grid-cols-3">
              <input name="name" required placeholder="Competition name" className="h-10 rounded border border-white/10 bg-[#100d16] px-3 text-sm text-white" />
              <input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="url-slug" className="h-10 rounded border border-white/10 bg-[#100d16] px-3 text-sm text-white" />
              <button className="gold-button">Create draft</button>
            </form>}
            {showForm && <section className="mt-6 rounded-xl border border-[#d8b56d]/25 bg-[#191421] p-6">
              <div className="flex justify-between"><h2 className="font-serif text-2xl text-[#f5e9d0]">{editing ? "Edit contestant" : "New contestant"}</h2><button onClick={() => setShowForm(false)} className="text-xs text-[#b9aebe]">Close</button></div>
              <form action={saveContestant} className="mt-5 grid gap-4 sm:grid-cols-2">
                <input type="hidden" name="id" value={editing?.id ?? ""} />
                <label className="text-xs text-[#e7dcc8]">Competition<select name="competition_id" required defaultValue={editing?.competition_id ?? selectedCompetition} className="mt-2 h-11 w-full rounded border border-white/10 bg-[#100d16] px-3 text-sm text-white">{competitions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
                <label className="text-xs text-[#e7dcc8]">Contestant number<input name="contestant_number" defaultValue={editing?.contestant_number ?? ""} placeholder="e.g. 01" className="mt-2 h-11 w-full rounded border border-white/10 bg-[#100d16] px-3 text-sm text-white" /></label>
                <label className="text-xs text-[#e7dcc8]">Full name<input name="full_name" required minLength={2} defaultValue={editing?.full_name ?? ""} className="mt-2 h-11 w-full rounded border border-white/10 bg-[#100d16] px-3 text-sm text-white" /></label>
                <label className="text-xs text-[#e7dcc8]">Stage name (optional)<input name="stage_name" defaultValue={editing?.stage_name ?? ""} className="mt-2 h-11 w-full rounded border border-white/10 bg-[#100d16] px-3 text-sm text-white" /></label>
                <label className="text-xs text-[#e7dcc8]">Display order<input name="display_order" type="number" min="0" defaultValue={editing?.display_order ?? 0} className="mt-2 h-11 w-full rounded border border-white/10 bg-[#100d16] px-3 text-sm text-white" /></label>
                <label className="text-xs text-[#e7dcc8]">Official photo (JPG, PNG, WebP · max 5 MB)<input name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-xs text-[#b9aebe]" /></label>
                <label className="text-xs text-[#e7dcc8] sm:col-span-2">Biography<textarea name="biography" rows={4} defaultValue={editing?.biography ?? ""} className="mt-2 w-full rounded border border-white/10 bg-[#100d16] p-3 text-sm text-white" /></label>
                <label className="flex items-center gap-2 text-xs text-[#e7dcc8] sm:col-span-2"><input type="checkbox" name="is_active" defaultChecked={editing?.is_active ?? true} /> Active contestant</label>
                <div className="flex gap-3 sm:col-span-2"><button className="gold-button">{editing ? "Save changes" : "Add contestant"}</button><button type="button" onClick={() => setShowForm(false)} className="outline-button">Cancel</button></div>
              </form>
            </section>}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {contestants.filter(c => c.competition_id === selectedCompetition).map(c => <article key={c.id} className="overflow-hidden rounded-xl border border-white/10 bg-[#191421]">
                {c.photo_url ? <img src={c.photo_url} alt={c.full_name} className="h-64 w-full object-cover" /> : <div className="flex h-48 items-center justify-center bg-[#100d16] font-serif text-4xl text-[#d8b56d]">♕</div>}
                <div className="p-5"><div className="flex items-center justify-between gap-2"><span className="text-[10px] tracking-widest text-[#d8b56d]">#{c.contestant_number || "—"}</span><span className={c.is_active ? "text-[10px] text-emerald-300" : "text-[10px] text-[#b9aebe]"}>{c.is_active ? "ACTIVE" : "INACTIVE"}</span></div>
                  <h3 className="mt-3 font-serif text-xl text-[#f5e9d0]">{c.stage_name || c.full_name}</h3><p className="mt-1 text-xs text-[#b9aebe]">{c.full_name}</p><p className="mt-3 line-clamp-3 text-xs leading-5 text-[#b9aebe]">{c.biography || "No biography added."}</p>
                  <div className="mt-5 flex gap-2"><button onClick={() => {setEditing(c);setShowForm(true);window.scrollTo({top:0,behavior:"smooth"});}} className="outline-button flex-1">Edit</button><form action={toggleContestant}><input type="hidden" name="id" value={c.id}/><input type="hidden" name="active" value={String(!c.is_active)}/><button className="outline-button flex-1">{c.is_active ? "Deactivate" : "Activate"}</button></form></div>
                </div>
              </article>)}
            </div>
            {!contestants.some(c => c.competition_id === selectedCompetition) && <div className="mt-8 rounded-lg border border-dashed border-white/15 p-10 text-center text-sm text-[#b9aebe]">No contestants in this competition yet. Select “Add contestant” to create the first profile.</div>}
          </>
        )}
      </div>
    </main>
  );
}
