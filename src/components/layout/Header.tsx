import { Link, useLocation } from 'react-router-dom';

const ChevronDown = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={3}
    stroke="currentColor"
    aria-hidden="true"
    className="inline-block h-4 w-4 transition-transform duration-300"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    aria-hidden="true"
    className="h-5 w-5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const AccountIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    aria-hidden="true"
    className="h-5 w-5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

interface NavItemProps {
  children: React.ReactNode;
  href?: string;
  to?: string;
  hasDropdown?: boolean;
  isActive?: boolean;
}

function NavItem({ children, href, to, hasDropdown = true, isActive = false }: NavItemProps) {
  const inner = (
    <div className={`mt-0.5 flex h-full items-center border-b-2 pb-1 transition-colors duration-300 ${isActive ? 'border-primary-500' : 'border-transparent hover:border-primary-500'}`}>
      <div className="flex items-center gap-2 text-[15px] leading-4 font-bold text-white">
        <div className="flex-1">{children}</div>
        {hasDropdown && <ChevronDown />}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="flex h-full items-stretch focus-visible:outline-2 focus-visible:outline-primary-500">
        {inner}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className="flex h-full items-stretch focus-visible:outline-2 focus-visible:outline-primary-500">
        {inner}
      </a>
    );
  }

  return (
    <button type="button" className="flex h-full items-stretch focus-visible:outline-2 focus-visible:outline-primary-500">
      {inner}
    </button>
  );
}

export default function Header() {
  const location = useLocation();
  const isNewsActive = location.pathname.startsWith('/news');

  return (
    <header className="z-50 bg-slate-800">
      {/* Main nav */}
      <nav className="h-14 bg-slate-800">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 px-4 md:px-10 xl:px-4">
          {/* Logo */}
          <Link to="/news" aria-label="BrokerChooser logo" className="flex-shrink-0 focus-visible:outline-2 focus-visible:outline-primary-500">
            <img
              src="https://brokerchooser.com/images/logo.svg"
              alt="BrokerChooser logo"
              className="h-12 w-auto max-w-56"
            />
          </Link>

          {/* Desktop nav items */}
          <div className="hidden items-stretch gap-6 xl:flex h-full">
            <NavItem href="https://brokerchooser.com/best-brokers">Best brokers</NavItem>
            <NavItem href="https://brokerchooser.com/broker-reviews">Broker reviews</NavItem>
            <NavItem href="https://brokerchooser.com/tools">Tools</NavItem>
            <NavItem to="/news" hasDropdown={false} isActive={isNewsActive}>News</NavItem>
            <NavItem href="https://brokerchooser.com/about-us">About us</NavItem>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4 xl:gap-6">
            {/* Search */}
            <button
              type="button"
              aria-label="search"
              className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-primary-500"
            >
              <SearchIcon />
            </button>

            {/* Account */}
            <button
              type="button"
              aria-label="Personal account"
              className="hidden items-center justify-center text-white transition-colors hover:text-slate-300 xl:flex focus-visible:outline-2 focus-visible:outline-primary-500"
            >
              <AccountIcon />
            </button>

            {/* Language selector */}
            <button
              type="button"
              aria-label="language selector"
              className="hidden items-center gap-1.5 text-sm font-medium text-white xl:flex focus-visible:outline-2 focus-visible:outline-primary-500"
            >
              <img
                src="https://brokerchooser.com/uploads/images/country_flags/hu.svg"
                alt=""
                className="h-4 w-6 rounded-sm object-cover"
              />
              <span>EN</span>
            </button>

            {/* CTA */}
            <a
              href="https://brokerchooser.com/find-my-broker"
              className="hidden rounded-lg bg-primary-500 px-4 py-2 text-base font-semibold text-slate-950 transition-colors hover:bg-primary-400 xl:block focus-visible:outline-2 focus-visible:outline-primary-500"
            >
              Find my broker
            </a>

            {/* Mobile menu button */}
            <button
              type="button"
              aria-label="mobile menu"
              className="flex h-11 w-11 items-center justify-center rounded-full text-white xl:hidden focus-visible:outline-2 focus-visible:outline-primary-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
