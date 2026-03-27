const LinkItem = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li>
    <a
      href={href}
      className="text-base text-slate-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-primary-500"
    >
      {children}
    </a>
  </li>
);

const SocialIcon = ({ href, label, children }: { href: string; label: string; children: React.ReactNode }) => (
  <a
    href={href}
    aria-label={label}
    className="text-slate-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-primary-500"
  >
    {children}
  </a>
);

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-400 mt-16">
      {/* Link columns */}
      <div className="mx-auto max-w-7xl px-4 md:px-10 xl:px-4 pt-12 pb-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* More trusted brokers */}
          <div>
            <h4 className="mb-5 text-base font-semibold uppercase tracking-wide text-slate-200">
              More trusted brokers
            </h4>
            <ul className="space-y-3">
              <LinkItem href="https://brokerchooser.com/broker-reviews/xm-review">XM review</LinkItem>
              <LinkItem href="https://brokerchooser.com/broker-reviews/moomoo-review">moomoo review</LinkItem>
              <LinkItem href="https://brokerchooser.com/broker-reviews/zerodha-review">Zerodha review</LinkItem>
              <LinkItem href="https://brokerchooser.com/broker-reviews/fidelity-review">Fidelity review</LinkItem>
              <LinkItem href="https://brokerchooser.com/broker-reviews/capitalcom-review">Capital.com review</LinkItem>
              <LinkItem href="https://brokerchooser.com/broker-reviews/vantage-markets-review">Vantage review</LinkItem>
              <LinkItem href="https://brokerchooser.com/broker-reviews/ig-review">IG review</LinkItem>
              <LinkItem href="https://brokerchooser.com/broker-reviews/stake-review">Stake review</LinkItem>
            </ul>
          </div>

          {/* Scam brokers to avoid */}
          <div>
            <h4 className="mb-5 text-base font-semibold uppercase tracking-wide text-slate-200">
              Scam brokers to avoid
            </h4>
            <ul className="space-y-3">
              <LinkItem href="https://brokerchooser.com/safety/quotex-broker-safe-or-scam">Quotex Broker scam</LinkItem>
              <LinkItem href="https://brokerchooser.com/safety/pocket-option-safe-or-scam">Pocket Option scam</LinkItem>
              <LinkItem href="https://brokerchooser.com/safety/immediate-edge-safe-or-scam">Immediate Edge scam</LinkItem>
              <LinkItem href="https://brokerchooser.com/safety/quantum-ai-trading-safe-or-scam">Quantum AI Trading scam</LinkItem>
              <LinkItem href="https://brokerchooser.com/safety/neo-banque-safe-or-scam">Neo Banque scam</LinkItem>
              <LinkItem href="https://brokerchooser.com/safety/tradingfx-global-safe-or-scam">TradingFX Global scam</LinkItem>
              <LinkItem href="https://brokerchooser.com/safety/bybit-safe-or-scam">Bybit broker scam</LinkItem>
              <LinkItem href="https://brokerchooser.com/safety/apex-bitcoin-mining-safe-or-scam">Apex Bitcoin Mining scam</LinkItem>
            </ul>
          </div>

          {/* Brokers by country */}
          <div>
            <h4 className="mb-5 text-base font-semibold uppercase tracking-wide text-slate-200">
              Brokers by country
            </h4>
            <ul className="space-y-3">
              <LinkItem href="https://brokerchooser.com/best-brokers/best-international-online-brokers-for-citizens-in-the-united-states">United States</LinkItem>
              <LinkItem href="https://brokerchooser.com/best-brokers/best-international-online-brokers-for-citizens-in-the-united-kingdom">United Kingdom</LinkItem>
              <LinkItem href="https://brokerchooser.com/best-brokers/best-international-online-brokers-for-citizens-in-india">India</LinkItem>
              <LinkItem href="https://brokerchooser.com/best-brokers/best-international-online-brokers-for-citizens-in-singapore">Singapore</LinkItem>
              <LinkItem href="https://brokerchooser.com/best-brokers/best-international-online-brokers-for-citizens-in-australia">Australia</LinkItem>
              <LinkItem href="https://brokerchooser.com/best-brokers/best-international-online-brokers-for-citizens-in-malaysia">Malaysia</LinkItem>
              <LinkItem href="https://brokerchooser.com/best-brokers/best-international-online-brokers-for-citizens-in-canada">Canada</LinkItem>
              <LinkItem href="https://brokerchooser.com/best-brokers/best-international-online-brokers-for-citizens-in-the-philippines">Philippines</LinkItem>
            </ul>
          </div>

          {/* About BrokerChooser */}
          <div>
            <h4 className="mb-5 text-base font-semibold uppercase tracking-wide text-slate-200">
              About BrokerChooser
            </h4>
            <ul className="space-y-3">
              <LinkItem href="https://brokerchooser.com/about-us">About us</LinkItem>
              <LinkItem href="https://brokerchooser.com/for-businesses">For Businesses</LinkItem>
              <LinkItem href="https://brokerchooser.com/our-methodology">Our Methodology</LinkItem>
              <LinkItem href="https://brokerchooser.com/our-team">Our team</LinkItem>
              <LinkItem href="https://brokerchooser.com/ai-visibility-leaderboard">AI visibility leaderboard</LinkItem>
              <LinkItem href="https://brokerchooser.com/careers">Careers</LinkItem>
              <LinkItem href="https://brokerchooser.com/contact">Contact</LinkItem>
              <LinkItem href="https://brokerchooser.com/data-dashboard">Data dashboard</LinkItem>
            </ul>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-4 md:px-10 xl:px-4">
        <div className="border-t border-slate-700" />
      </div>

      {/* Bottom section: disclaimers + social + legal */}
      <div className="mx-auto max-w-7xl px-4 md:px-10 xl:px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Disclaimers */}
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-bold text-slate-300">Disclaimer:</p>
              <p className="text-sm leading-relaxed text-slate-400">
                Please note that by investing in and/or trading financial instruments, commodities and any other assets,
                you are taking a high degree of risk and you can lose all your deposited money. You should engage in any
                such activity only if you are fully aware of the relevant risks. BrokerChooser does not provide investment
                or any other advice, for further information please read our{' '}
                <a href="https://brokerchooser.com/general-terms-and-conditions" className="font-bold text-slate-300 underline hover:text-white">
                  General Terms and Conditions
                </a>.
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-slate-300">Advertiser Disclosure:</p>
              <p className="text-sm leading-relaxed text-slate-400">
                At BrokerChooser, we consider clarity and transparency as core values. BrokerChooser is free to use for
                everyone, but earns a commission from some of its partners with no additional cost to you (please find the{' '}
                <a href="https://brokerchooser.com/partners" className="font-bold text-slate-300 underline hover:text-white">
                  list of such partners here
                </a>
                ). However, please note that all the material and information made available by BrokerChooser or any of its
                affiliates is based on{' '}
                <a href="https://brokerchooser.com/our-methodology" className="font-bold text-slate-300 underline hover:text-white">
                  our proprietary professional methodology
                </a>
                , which is unbiased, prepared in accordance with the best interest of our customers and most importantly
                independent from the remuneration structure we have in place with some of our partners.
              </p>
            </div>
          </div>

          {/* Right column: social + copyright + legal links */}
          <div className="flex flex-col items-start lg:items-end gap-6">
            {/* Social icons */}
            <div className="flex items-center gap-5">
              <SocialIcon href="https://www.linkedin.com/company/brokerchooser/" label="LinkedIn">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </SocialIcon>
              <SocialIcon href="https://www.youtube.com/@BrokerChooser" label="YouTube">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </SocialIcon>
              <SocialIcon href="https://www.tiktok.com/@brokerchooser" label="TikTok">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
              </SocialIcon>
              <SocialIcon href="https://twitter.com/brokerchooser" label="X/Twitter">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </SocialIcon>
              <SocialIcon href="https://www.facebook.com/BrokerChooser/" label="Facebook">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </SocialIcon>
              <SocialIcon href="https://www.instagram.com/brokerchooser/" label="Instagram">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.88 0 1.441 1.441 0 012.88 0z" /></svg>
              </SocialIcon>
              <SocialIcon href="https://www.reddit.com/r/brokerchooser/" label="Reddit">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 00.029-.463.33.33 0 00-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.232-.095z" /></svg>
              </SocialIcon>
            </div>

            {/* Copyright */}
            <div className="text-right">
              <p className="text-sm text-slate-400">
                Copyright <span className="font-bold text-white">BROKER</span><span className="font-bold text-primary-500">CHOOSER</span> Ltd. 2026.
              </p>
              <p className="mt-1 text-sm text-slate-400">Company reg#: C86950</p>
            </div>

            {/* Legal links */}
            <div className="flex flex-col items-start lg:items-end gap-2">
              <a href="https://brokerchooser.com/privacy-policy" className="text-sm text-primary-500 hover:text-primary-400 transition-colors">Privacy Policy</a>
              <a href="https://brokerchooser.com/cookie-policy" className="text-sm text-primary-500 hover:text-primary-400 transition-colors">Cookie Policy</a>
              <a href="https://brokerchooser.com/general-terms-and-conditions" className="text-sm text-primary-500 hover:text-primary-400 transition-colors">General Terms and Conditions</a>
              <button type="button" className="text-sm text-primary-500 hover:text-primary-400 transition-colors focus-visible:outline-2 focus-visible:outline-primary-500">Cookie Preferences</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
