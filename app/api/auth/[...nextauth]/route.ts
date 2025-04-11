import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
// Import server initialization to ensure database is set up
import "@/lib/server-init";

// Add error handling wrapper
const handler = async (req: Request, context: any) => {
  try {
    console.log('NextAuth handler called with path:', req.url);
    return await NextAuth(authOptions)(req, context);
  } catch (error) {
    console.error('NextAuth error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export { handler as GET, handler as POST };
