import { UserModel } from './models/user';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

// This is a server-side module
// Add a safety check to prevent client-side usage
if (typeof window !== 'undefined') {
  // We're on the client side - provide a helpful error message
  console.warn('Warning: auth.ts should only be imported on the server side');
  // Don't throw an error as it would break the app, but log a warning
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Credentials provider for email/password login
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'jsmith@example.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing email or password');
        }

        try {
          // Find the user by email
          const user = await UserModel.findByEmail(credentials.email);

          if (!user) {
            throw new Error('Invalid email or password');
          }

          // Verify password
          const isPasswordValid = await UserModel.verifyPassword(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error('Invalid credentials');
          }

          // Return user object with id as string
          return {
            id: user._id?.toString() || '',
            name: user.name,
            email: user.email,
            standard: user.standard || undefined,
            weaktopics: user.weaktopics || []
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error('Authentication failed');
        }
      }
    }),
    // Google provider for OAuth login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.standard = user.standard;
        token.weaktopics = user.weaktopics;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.standard = token.standard as string;
        session.user.weaktopics = token.weaktopics as string[];
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
};

// Add type definitions for NextAuth
declare module 'next-auth' {
  interface User {
    id: string;
    name: string;
    email: string;
    standard?: string;
    weaktopics?: string[];
  }

  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name: string;
    email: string;
    standard?: string;
    weaktopics?: string[];
  }
}
