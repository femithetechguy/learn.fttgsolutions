'use client'

import { useState } from 'react'
import { MessageSquare, CornerDownRight, Send } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import commentsData from '../../data/article_comments.json'

// ─── Types (ready for backend wiring) ────────────────────────────────────────

export interface CommentReply {
  id:     string
  author: string
  body:   string
  date:   string
}

export interface Comment {
  id:      string
  author:  string
  body:    string
  date:    string
  replies: CommentReply[]
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-6 h-6' : 'w-7 h-7'
  const text = size === 'sm' ? 'text-[10px]' : 'text-xs'
  return (
    <div className={`${dim} rounded-sm bg-white/5 flex items-center justify-center shrink-0`}>
      <span className={`font-sans ${text} font-bold text-text-muted uppercase`}>
        {name[0]}
      </span>
    </div>
  )
}

// ─── Reply form (inline under a comment) ─────────────────────────────────────

function ReplyForm({
  parentAuthor,
  onCancel,
}: {
  parentAuthor: string
  onCancel: () => void
}) {
  const [body, setBody] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    // TODO: POST reply to backend
    setDone(true)
    setBody('')
    setTimeout(() => { setDone(false); onCancel() }, 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder={`Reply to ${parentAuthor}…`}
        rows={2}
        className="w-full bg-bg-elevated border border-white/10 rounded-sm px-3 py-2 font-sans text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/40 transition-colors resize-none"
      />
      <div className="flex items-center gap-3 mt-1.5">
        {done && (
          <span className="font-sans text-xs text-gold">Reply noted — coming soon.</span>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="font-sans text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!body.trim()}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 border border-gold/20 text-gold font-sans text-xs font-semibold rounded-sm hover:bg-gold hover:text-bg-primary transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={11} />
          Reply
        </button>
      </div>
    </form>
  )
}

// ─── Single comment + its replies ────────────────────────────────────────────

function CommentThread({ comment, user }: { comment: Comment; user: ReturnType<typeof useAuth>['user'] }) {
  const [replying, setReplying] = useState(false)

  return (
    <div className="flex gap-3">
      <Avatar name={comment.author} />

      <div className="flex-1 min-w-0">
        {/* Author + date */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-sans text-sm font-semibold text-text-primary">{comment.author}</span>
          <span className="font-sans text-xs text-text-muted">{comment.date}</span>
        </div>

        {/* Body */}
        <p className="font-sans text-sm text-text-secondary leading-relaxed">{comment.body}</p>

        {/* Reply trigger */}
        {user && (
          <button
            onClick={() => setReplying(v => !v)}
            className="mt-2 flex items-center gap-1 font-sans text-xs text-text-muted hover:text-gold transition-colors duration-150"
          >
            <CornerDownRight size={11} />
            Reply
          </button>
        )}

        {replying && (
          <ReplyForm parentAuthor={comment.author} onCancel={() => setReplying(false)} />
        )}

        {/* Nested replies */}
        {comment.replies.length > 0 && (
          <div className="mt-4 pl-4 border-l border-white/10 space-y-4">
            {comment.replies.map(reply => (
              <div key={reply.id} className="flex gap-2.5">
                <Avatar name={reply.author} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-sans text-sm font-semibold text-text-primary">{reply.author}</span>
                    <span className="font-sans text-xs text-text-muted">{reply.date}</span>
                  </div>
                  <p className="font-sans text-sm text-text-secondary leading-relaxed">{reply.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main comments section ────────────────────────────────────────────────────

export default function GuideComments({ slug }: { slug: string }) {
  const { user } = useAuth()
  const [body, setBody]       = useState('')
  const [submitted, setSubmitted] = useState(false)

  // TODO: replace with real fetch(`/api/articles/${slug}/comments`)
  const comments: Comment[] = (commentsData as Record<string, Comment[]>)[slug] ?? []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    // TODO: POST to backend
    setSubmitted(true)
    setBody('')
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <section className="mt-16 pt-10 border-t border-white/10">

      {/* Section header */}
      <div className="flex items-center gap-2 mb-8">
        <MessageSquare size={18} className="text-gold" />
        <h2 className="font-display font-bold text-text-primary text-xl">Discussion</h2>
        <span className="font-sans text-xs text-text-muted ml-0.5">({comments.length})</span>
      </div>

      {/* Comment form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-sm bg-gold/20 flex items-center justify-center shrink-0">
              <span className="font-sans text-xs font-bold text-gold uppercase">
                {user.name?.[0] ?? 'U'}
              </span>
            </div>
            <span className="font-sans text-sm font-semibold text-text-primary">{user.name}</span>
          </div>

          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Share your thoughts…"
            rows={3}
            className="w-full bg-bg-elevated border border-white/10 rounded-sm px-4 py-3 font-sans text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/40 transition-colors resize-none"
          />

          <div className="flex items-center mt-2">
            {submitted && (
              <span className="font-sans text-xs text-gold">
                Thanks — comments will be live soon.
              </span>
            )}
            <button
              type="submit"
              disabled={!body.trim()}
              className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-gold/10 border border-gold/20 text-gold font-sans text-sm font-semibold rounded-sm hover:bg-gold hover:text-bg-primary transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed bevel"
            >
              <Send size={13} />
              Post
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-10 p-4 bg-bg-elevated border border-white/10 rounded-sm flex items-center justify-between gap-4">
          <span className="font-sans text-sm text-text-secondary">Sign in to join the discussion.</span>
          <a href="/" className="font-sans text-sm font-semibold text-gold hover:underline shrink-0">
            Sign in
          </a>
        </div>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="py-10 flex flex-col items-center gap-2 text-center">
          <MessageSquare size={28} className="text-text-muted opacity-30" />
          <p className="font-sans text-sm text-text-muted">No comments yet. Start the discussion.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {comments.map(c => (
            <CommentThread key={c.id} comment={c} user={user} />
          ))}
        </div>
      )}

    </section>
  )
}
