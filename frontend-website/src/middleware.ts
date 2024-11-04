import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';

// export default clerkMiddleware();

const isProtectedRoute = createRouteMatcher([
    "/communities(.*)",
    "/roadmaps/form(.*)"
]);

const clerkHandler = clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export default function middleware(req: NextRequest, ev: NextFetchEvent) {
  const res = clerkHandler(req, ev);

  if (res instanceof NextResponse) {
      res.headers.delete('X-Robots-Tag');
      res.headers.set('X-Robots-Tag', 'index, follow');
  }

  return res;
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};