import { FileCode2, FileText } from 'lucide-react'
import {
  chatFlowEyebrow,
  chatFlowHeading,
  chatFlowSubheading,
  chatPhases,
} from '@/lib/chat-flow-script'
import type { ChatAttachment, ChatMessage } from '@/lib/chat-flow-script'
import {
  ChatAvatar,
  ChatMessageRow,
  ChatTypingDots,
} from '@/components/chat-message-row'
import { ChatConversation } from '@/components/chat-conversation'
import { ChatPhaseDivider } from '@/components/chat-phase-divider'
import { ChatPhaseRail } from '@/components/chat-phase-rail'
import { SectionEyebrow } from '@/components/ui/section-eyebrow'

// The reveal cursor is conversation-wide, so rows are indexed across phases
// rather than within them.
const conversationSenders = chatPhases
  .flatMap((phase) => phase.messages)
  .map((message) => message.sender)

// Derived here and passed down so the rail stays a client component without
// pulling `chat-flow-script` — and all twelve messages of copy — into the
// client bundle to duplicate what the exported HTML already carries.
const railPhases = chatPhases.map((phase) => ({
  step: phase.step,
  count: phase.messages.length,
}))

function phaseOffset(phaseIndex: number) {
  return chatPhases
    .slice(0, phaseIndex)
    .reduce((total, phase) => total + phase.messages.length, 0)
}

function Attachment({ attachment }: { attachment: ChatAttachment }) {
  const Icon = attachment.kind === 'pdf' ? FileText : FileCode2

  return (
    <span className="mt-2 flex w-fit items-center gap-2 rounded-xl bg-alabaster/20 px-3 py-2 font-body text-sm text-alabaster">
      <Icon className="h-4 w-4 shrink-0 text-alabaster" aria-hidden="true" />
      {attachment.name}
    </span>
  )
}

function MessageLine({ line, emphasis }: { line: string; emphasis?: string }) {
  if (!emphasis || !line.includes(emphasis)) {
    return <span className="block">{line}</span>
  }

  const [before, ...rest] = line.split(emphasis)

  return (
    <span className="block">
      {before}
      <strong className="font-medium text-alabaster">{emphasis}</strong>
      {rest.join(emphasis)}
    </span>
  )
}

function MessageBody({ message }: { message: ChatMessage }) {
  return (
    <>
      {message.lines.map((line) => (
        <MessageLine key={line} line={line} emphasis={message.emphasis} />
      ))}
      {message.attachment ? (
        <Attachment attachment={message.attachment} />
      ) : null}
    </>
  )
}

export function ChatFlowSection() {
  return (
    <section
      id="como-fazemos"
      className="bg-carbon-black px-6 py-16 md:px-12 md:py-24"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <SectionEyebrow>{chatFlowEyebrow}</SectionEyebrow>

        <h2 className="font-heading text-3xl font-black leading-tight text-alabaster md:text-4xl">
          {chatFlowHeading}
        </h2>
        <p className="max-w-md font-body text-base text-platinum-gray">
          {chatFlowSubheading}
        </p>

        <ChatConversation senders={conversationSenders}>
          {/* No overflow-hidden here: any ancestor with overflow becomes the
              scrollport and silently kills the rail's sticky behaviour. */}
          <div className="relative mt-4">
            <ChatPhaseRail phases={railPhases} className="hidden lg:block" />

            <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
              {chatPhases.map((phase, phaseIndex) => (
                <div key={phase.id} className="flex flex-col gap-4">
                  <ChatPhaseDivider
                    step={phase.step}
                    label={phase.label}
                    reachedAt={phaseOffset(phaseIndex) + 1}
                  />

                  {phase.messages.map((message, index) => (
                    <ChatMessageRow
                      key={message.id}
                      index={phaseOffset(phaseIndex) + index}
                      sender={message.sender}
                      footer={
                        message.reaction ? (
                          <span className="w-fit rounded-full border border-alabaster/15 bg-alabaster/10 px-3 py-1 font-body text-xs text-alabaster">
                            {message.reaction}
                          </span>
                        ) : undefined
                      }
                    >
                      <MessageBody message={message} />
                    </ChatMessageRow>
                  ))}
                </div>
              ))}

              <div
                data-testid="chat-flow-typing"
                className="flex items-end gap-3"
              >
                <ChatAvatar sender="client" />
                <span className="rounded-2xl bg-alabaster/10 px-4 py-3.5">
                  <ChatTypingDots />
                </span>
              </div>
            </div>
          </div>
        </ChatConversation>
      </div>
    </section>
  )
}
