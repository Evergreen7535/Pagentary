"use client";

import { useState } from "react";
import Link from "next/link";
import { createCompetition, deleteCompetition, saveCompetition } from "./actions";

type Competition = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "draft" | "live" | "closed" | "archived";
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
};

function localDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

export default function CompetitionManager({
  competitions, error, saved,
}: {
  competitions: Competition[];
  error?: string;
  saved?: string;
}) {
  const [editing, setEditing] = useState<Competition | null>(null);
  const [showCreate, setShowCreate] = useState(competitions.length === 0);

  const errorMessage = error === "has_history"
    ? "This competition has payment records. It cannot be deleted; archive it instead to preserve its voting and financial history."
    : error === "confirmation"
      ? "The competition name confirmation did not match. Nothing was deleted."
      : error === "details"
        ? "Check the competition name, URL slug and dates. The end date must be later than the start date."
        : error === "delete"
          ? "The competition could not be deleted. It may contain protected payment or vote records."
          : error === "save"
            ? "We could not save the competition. The URL slug may already be in use."
            : "";

  return (
    <main className="page-shell min-h-screen">
      <header className="border-b border-white/10 bg-[#100d16]/90">
        <div className="site-container flex min-h-[76px] items-center justify-between gap-4">
          <Link href="/admin" className="font-serif text-lg tracking-[.12em] text-[#f5e9d0]">PAGENTARY <span className="font-sans text-[9px] text-[#b9a47b]">ADMIN</span></Link>
          <Link href="/admin" className="text-xs text-[#c9c0ce] hover:text-white">Back to dashboard</Link>
        </div>
      </header>

      <div className="site-container py-10">
        <p className="eyebrow">Platform configuration</p>
        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-serif text-4xl text-[#f8f1e7]">Competition management</h1>
            <p className="mt-2 text-sm text-[#b9aebe]">Create, edit, publish, close, archive or safely delete competitions.</p>
          </div>
          <button onClick={() => { setEditing(null); setShowCreate(v => !v); }} className="gold-button">
            {showCreate ? "Close form" : "Add competition"}
          </button>
        </div>

        {errorMessage && <p role="alert" className="mt-6 rounded border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{errorMessage}</p>}
        {saved && <p className="mt-6 rounded border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">
          {saved === "created" ? "Competition created successfully." : saved === "deleted" ? "Competition deleted." : "Competition changes saved successfully."}
        </p>}

        {showCreate && (
          <section className="mt-7 rounded-xl border border-[#d8b56d]/25 bg-[#191421] p-6">
            <h2 className="font-serif text-2xl text-[#f5e9d0]">Create a competition</h2>
            <p className="mt-2 text-xs leading-5 text-[#b9aebe]">New competitions start as drafts and are not visible to the public until set to Live.</p>
            <form action={createCompetition} className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-xs text-[#e7dcc8]">Competition name
                <input name="name" required minLength={2} placeholder="e.g. Miss Evergreen 2027" className="mt-2 h-11 w-full rounded border border-white/10 bg-[#100d16] px-3 text-sm text-white" />
              </label>
              <label className="text-xs text-[#e7dcc8]">URL slug
                <input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="miss-evergreen-2027" className="mt-2 h-11 w-full rounded border border-white/10 bg-[#100d16] px-3 text-sm text-white" />
              </label>
              <label className="text-xs text-[#e7dcc8] sm:col-span-2">Description
                <textarea name="description" rows={3} className="mt-2 w-full rounded border border-white/10 bg-[#100d16] p-3 text-sm text-white" />
              </label>
              <button className="gold-button sm:col-span-2">Create draft competition</button>
            </form>
          </section>
        )}

        {editing && (
          <section className="mt-7 rounded-xl border border-[#d8b56d]/25 bg-[#191421] p-6">
            <div className="flex items-start justify-between gap-3">
              <div><p className="eyebrow">Edit competition</p><h2 className="mt-2 font-serif text-2xl text-[#f5e9d0]">{editing.name}</h2></div>
              <button onClick={() => setEditing(null)} className="text-xs text-[#b9aebe] underline">Close</button>
            </div>
            <form action={saveCompetition} className="mt-5 grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="id" value={editing.id} />
              <label className="text-xs text-[#e7dcc8]">Competition name
                <input name="name" required minLength={2} defaultValue={editing.name} className="mt-2 h-11 w-full rounded border border-white/10 bg-[#100d16] px-3 text-sm text-white" />
              </label>
              <label className="text-xs text-[#e7dcc8]">URL slug
                <input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={editing.slug} className="mt-2 h-11 w-full rounded border border-white/10 bg-[#100d16] px-3 text-sm text-white" />
              </label>
              <label className="text-xs text-[#e7dcc8]">Competition status
                <select name="status" defaultValue={editing.status} className="mt-2 h-11 w-full rounded border border-white/10 bg-[#100d16] px-3 text-sm text-white">
                  <option value="draft">Draft</option><option value="live">Live</option><option value="closed">Closed</option><option value="archived">Archived</option>
                </select>
              </label>
              <label className="text-xs text-[#e7dcc8]">Start date and time
                <input name="starts_at" type="datetime-local" defaultValue={localDateTime(editing.starts_at)} className="mt-2 h-11 w-full rounded border border-white/10 bg-[#100d16] px-3 text-sm text-white" />
              </label>
              <label className="text-xs text-[#e7dcc8]">End date and time
                <input name="ends_at" type="datetime-local" defaultValue={localDateTime(editing.ends_at)} className="mt-2 h-11 w-full rounded border border-white/10 bg-[#100d16] px-3 text-sm text-white" />
              </label>
              <label className="text-xs text-[#e7dcc8] sm:col-span-2">Description
                <textarea name="description" rows={4} defaultValue={editing.description ?? ""} className="mt-2 w-full rounded border border-white/10 bg-[#100d16] p-3 text-sm text-white" />
              </label>
              <div className="flex flex-wrap gap-3 sm:col-span-2">
                <button className="gold-button">Save competition</button>
                <button type="button" onClick={() => setEditing(null)} className="outline-button">Cancel</button>
              </div>
            </form>
            <div className="mt-7 border-t border-white/10 pt-6">
              <h3 className="text-sm font-semibold text-red-200">Danger zone</h3>
              <p className="mt-2 text-xs leading-5 text-[#b9aebe]">Deletion permanently removes this competition and its contestants. It is blocked if any payment record exists. If the competition has voting or payment history, archive it instead.</p>
              <form action={deleteCompetition} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input type="hidden" name="id" value={editing.id} />
                <input name="confirm_name" required placeholder={`Type exactly: ${editing.name}`} className="h-11 min-w-0 flex-1 rounded border border-red-400/20 bg-[#100d16] px-3 text-sm text-white" />
                <button className="rounded border border-red-400/40 px-4 py-2 text-xs font-semibold text-red-200 hover:bg-red-400/10">Permanently delete</button>
              </form>
            </div>
          </section>
        )}

        <section className="mt-8 grid gap-4">
          {competitions.map(competition => (
            <article key={competition.id} className="rounded-xl border border-white/10 bg-[#191421] p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-serif text-xl text-[#f5e9d0]">{competition.name}</h2>
                    <span className={competition.status === "live" ? "rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-200" : "rounded-full bg-white/5 px-2 py-1 text-[10px] text-[#c9c0ce]"}>{competition.status.toUpperCase()}</span>
                  </div>
                  <p className="mt-2 text-xs text-[#b9aebe]">/{competition.slug}</p>
                  {competition.description && <p className="mt-2 max-w-2xl text-sm leading-6 text-[#b9aebe]">{competition.description}</p>}
                </div>
                <button onClick={() => { setShowCreate(false); setEditing(competition); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="outline-button">Manage competition</button>
              </div>
            </article>
          ))}
          {!competitions.length && <div className="rounded-lg border border-dashed border-white/15 p-10 text-center text-sm text-[#b9aebe]">No competitions created yet.</div>}
        </section>

        <div className="mt-8 flex flex-wrap gap-4 text-xs">
          <Link href="/admin/contestants" className="text-[#e1c27e] underline">Manage contestants</Link>
          <Link href="/admin" className="text-[#e1c27e] underline">Return to dashboard</Link>
        </div>
      </div>
    </main>
  );
}
