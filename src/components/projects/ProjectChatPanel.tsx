import type { FeedbackMessage, ProjectMember } from "../../types/domain";
import type { ChatMessageAuthor, ProjectChatPanelProps } from "../../interfaces/project.interfaces";
import { formatDateTime, getInitials, titleize } from "../../utils/format";

function getChatParticipants(members: ProjectMember[], feedback: FeedbackMessage[]) {
  return Array.from(
    new Map(
      members
        .filter((member) => feedback.some((item) => item.authorId === member.userId))
        .map((member) => [member.userId, member])
    ).values()
  );
}

function getMessageAuthor(
  fb: FeedbackMessage,
  membersByUserId: Map<string, ProjectMember>,
  currentUser: ProjectChatPanelProps["currentUser"]
): ChatMessageAuthor {
  const member = membersByUserId.get(fb.authorId);
  const isMine = fb.authorId === currentUser?.id;
  const fallbackName = isMine ? currentUser?.name ?? "You" : "Project member";

  return {
    isMine,
    name: isMine ? "You" : member?.user?.name ?? "Project member",
    role: member?.user?.role ?? (isMine ? currentUser?.role : undefined),
    initials: getInitials(member?.user?.name ?? fallbackName),
  };
}

function roleBadgeClass(role?: string) {
  if (role === "client") return "bg-secondary-container text-black";
  if (role === "designer") return "bg-primary-container text-black";
  if (role === "admin") return "bg-tertiary-fixed text-black";
  return "bg-surface-container-high text-black";
}

export function ProjectChatPanel({
  feedback,
  members,
  currentUser,
  message,
  onMessageChange,
  onSend,
}: ProjectChatPanelProps) {
  const membersByUserId = new Map(members.map((member) => [member.userId, member]));
  const chatParticipants = getChatParticipants(members, feedback);

  return (
    <div className="sticky top-24 flex max-h-[calc(100vh-12rem)] flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
      <div className="border-b border-outline-variant px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-on-surface">Project chat</h2>
            <p className="mt-1 text-xs text-on-surface-variant">
              {feedback.length} {feedback.length === 1 ? "message" : "messages"}
            </p>
          </div>
          {chatParticipants.length > 0 && (
            <div className="flex items-center">
              {chatParticipants.slice(0, 4).map((member) => (
                <span
                  key={member.userId}
                  title={`${member.user?.name ?? "Project member"}${member.user?.role ? `, ${titleize(member.user.role)}` : ""}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface-container-lowest bg-surface-container-high text-[11px] font-bold text-on-surface -ml-2 first:ml-0"
                >
                  {getInitials(member.user?.name ?? "?")}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-surface-container-low p-4">
        {feedback.length === 0 ? (
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-6 text-center">
            <span className="material-symbols-outlined mb-2 text-[32px] text-on-surface-variant">forum</span>
            <p className="text-sm font-semibold text-on-surface">No messages yet</p>
            <p className="mt-1 text-xs text-on-surface-variant">Start the project conversation below.</p>
          </div>
        ) : (
          feedback.map((fb) => {
            const author = getMessageAuthor(fb, membersByUserId, currentUser);
            return (
              <div key={fb.id} className={`flex items-end gap-2 ${author.isMine ? "justify-end" : "justify-start"}`}>
                {!author.isMine && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-[11px] font-bold text-on-surface">
                    {author.initials}
                  </span>
                )}
                <div className={`flex max-w-[84%] flex-col ${author.isMine ? "items-end" : "items-start"}`}>
                  <div className={`mb-1 flex flex-wrap items-center gap-2 ${author.isMine ? "justify-end" : "justify-start"}`}>
                    <span className="text-[11px] font-bold text-black">{author.name}</span>
                    {author.role && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${roleBadgeClass(author.role)}`}>
                        {titleize(author.role)}
                      </span>
                    )}
                    <span className="text-[10px] text-outline">{formatDateTime(fb.createdAt)}</span>
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-3 shadow-sm ${
                      author.isMine
                        ? "rounded-br-md bg-primary-container text-black"
                        : "rounded-bl-md border border-outline-variant bg-surface-container-lowest text-on-surface"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm leading-5">{fb.message}</p>
                  </div>
                </div>
                {author.isMine && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-[11px] font-bold text-primary">
                    {author.initials}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={onSend} className="flex gap-2 border-t border-outline-variant bg-surface-container-lowest p-3">
        <input
          className="min-w-0 flex-1 rounded-full border border-outline-variant bg-surface-container-low px-4 py-2 text-sm text-on-surface outline-none placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="Message..."
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
        />
        <button
          type="submit"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!message.trim()}
          aria-label="Send message"
        >
          <span className="material-symbols-outlined text-[16px]">send</span>
        </button>
      </form>
    </div>
  );
}
