export function HowItWorks({ onCreate }: { onCreate: () => void }) {
  return (
    <div>
      {/* Hero — one idea, one CTA */}
      <section className="-mx-6 bg-vu-black px-6 py-24 text-center">
        <p className="eyebrow text-vu-gold">A pod is formed per request, not assigned in advance</p>
        <h1 className="mx-auto mt-4 max-w-4xl font-serif text-[clamp(2.75rem,7vw,5.5rem)] leading-[1.05] tracking-[-0.01em]">
          <span className="gold-gradient-text">Ask once. </span>
          <em className="gold-gradient-text">The right team forms.</em>
        </h1>
        <button className="btn-gold mt-10" onClick={onCreate}>Create request</button>
      </section>

      {/* Manifesto */}
      <section className="py-24">
        <p className="mx-auto max-w-3xl text-center font-serif text-[clamp(1.5rem,3vw,2.5rem)] leading-snug">
          You should never need to know our org chart to get help. You submit a need. We find the capabilities it
          requires, the people who hold them, and the capacity to start.
        </p>
      </section>

      {/* Numbered progression 01 / 02 / 03 */}
      <section className="-mx-6 bg-vu-white px-6 py-20">
        <div className="mx-auto max-w-[1200px]">
          <p className="eyebrow text-vu-oak">How a request becomes a working group</p>
          <h2 className="mt-2 font-serif text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.1]">It starts with a need</h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {[
              ['01', 'You describe it', 'Plain questions, no jargon. A completeness gate makes sure everything the work needs arrives before it starts — not three weeks after.'],
              ['02', 'The team assembles', 'Capability, capacity, and availability decide who joins — not job titles, not team boundaries. You watch it happen while you type.'],
              ['03', 'Status derives itself', 'Nobody updates a status field. What you see is computed from the work: who holds each task, what is blocked, what has left our boundary.'],
            ].map(([n, title, body], i) => (
              <div key={n} className={i > 0 ? 'border-t border-vu-gray-light pt-8 md:border-l md:border-t-0 md:pl-8 md:pt-0' : ''}>
                <div className="font-condensed text-5xl font-bold text-vu-gold">{n}</div>
                <h3 className="mt-3 font-serif text-2xl">{title}</h3>
                <p className="mt-2 text-vu-gray-dark">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Honesty section — dark */}
      <section className="-mx-6 bg-vu-black px-6 py-20 text-vu-white">
        <div className="mx-auto max-w-[1200px]">
          <p className="eyebrow text-vu-gold">What we promise</p>
          <h2 className="mt-2 font-serif text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.1]">
            Honest about <em className="text-vu-gold">constraint</em>
          </h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {[
              ['Every task has an owner and a clock', 'A task with an owner and no due date is a suggestion. We do not make suggestions.'],
              ['Queued means queued', 'When nobody has capacity, we say so — with your position in line and a projected start date. We do not assign work that cannot start.'],
              ['Exited means exited', 'When work leaves for the Leave Team or Immigration Services, we label it that way and track the return date. It never shows as "in progress" while nobody here can move it.'],
            ].map(([title, body]) => (
              <div key={title}>
                <p className="eyebrow text-vu-gold">{title}</p>
                <p className="mt-3 text-vu-white/80">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-24 text-center">
        <h2 className="font-serif text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.1]">
          Ready when <em className="text-vu-oak">you are</em>
        </h2>
        <button className="btn-gold mt-8" onClick={onCreate}>Create request</button>
      </section>
    </div>
  );
}
