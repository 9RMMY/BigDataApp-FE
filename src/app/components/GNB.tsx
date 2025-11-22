"use client";

import Link from "next/link";
import LinkButton from "./buttons/LinkButton";

const GNB = () => {
  return (
    <header className="text-white shadow-md">
      <nav className="bg-primary mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-8 lg:px-10">
        {/* logo */}
        <Link href="/" className="flex items-center">
          <div className="flex h-12 w-12 items-center justify-center text-lg font-bold tracking-tight">
            SocccerSight
          </div>
        </Link>

        {/* login & sign up */}
        <div className="flex items-center gap-4 text-sm font-medium">
          <LinkButton href="/login" variant="ghost" className="px-0">
            로그인
          </LinkButton>
          <div className="hidden h-4 w-px bg-white/50 sm:block" />
          <LinkButton href="/signup" variant="ghost" className="px-0">
            회원가입
          </LinkButton>
        </div>
      </nav>

      {/* 전체 네비게이션 */}
      <nav className="bg-black mx-auto flex h-12 w-full max-w-7xl items-center justify-between px-8 lg:px-10">
        <div className="flex items-center gap-4 text-sm font-medium">
          <LinkButton href="/player" variant="ghost" className="px-0">
            선수분석
          </LinkButton>
          <div className="hidden h-4 w-px bg-white/50 sm:block" />
          <LinkButton href="/mvp" variant="ghost" className="px-0">
            MVP & 베스트 11
          </LinkButton>
          <div className="hidden h-4 w-px bg-white/50 sm:block" />
          <LinkButton href="/trade" variant="ghost" className="px-0">
            트레이드
          </LinkButton>
          <div className="hidden h-4 w-px bg-white/50 sm:block" />
          <LinkButton href="/transfer" variant="ghost" className="px-0">
            영입방출
          </LinkButton>
          <div className="hidden h-4 w-px bg-white/50 sm:block" />
          <LinkButton href="/lineup" variant="ghost" className="px-0">
            라인업
          </LinkButton>
          <div className="hidden h-4 w-px bg-white/50 sm:block" />
          <LinkButton href="/strategy" variant="ghost" className="px-0">
            전략제안
          </LinkButton>
          <div className="hidden h-4 w-px bg-white/50 sm:block" />
          <LinkButton href="/playermanage" variant="ghost" className="px-0">
            선수관리
          </LinkButton>
        </div>
      </nav>
    </header>
  );
};

export default GNB;
